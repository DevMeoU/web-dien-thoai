<?php

namespace Tests\Feature;

use App\Models\Banner;
use App\Models\NewsletterSubscriber;
use App\Models\OrderItem;
use App\Models\Post;
use App\Models\Review;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\Concerns\CreatesShopData;
use Tests\TestCase;

class ContentFeaturesTest extends TestCase
{
    use CreatesShopData, RefreshDatabase;

    public function test_public_posts_only_show_published_posts_that_are_due(): void
    {
        $visible = Post::factory()->create(['title' => 'Bài đã đăng']);
        Post::factory()->create(['title' => 'Bản nháp', 'is_published' => false]);
        Post::factory()->create(['title' => 'Chưa đến giờ', 'published_at' => now()->addDay()]);

        $this->getJson('/api/posts')->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.title', 'Bài đã đăng');
        $this->getJson('/api/posts/'.$visible->slug)->assertOk()->assertJsonPath('data.title', 'Bài đã đăng');
        $this->getJson('/api/posts/'.Post::query()->where('title', 'Bản nháp')->value('slug'))->assertNotFound();
    }

    public function test_admin_manages_posts_and_customers_cannot(): void
    {
        $this->actingAsCustomer();
        $this->getJson('/api/admin/posts')->assertForbidden();
        $this->postJson('/api/admin/posts', ['title' => 'Bài mới'])->assertForbidden();

        $this->actingAsAdmin();
        $id = $this->postJson('/api/admin/posts', ['title' => 'Bài mới', 'content' => 'Nội dung'])
            ->assertCreated()->assertJsonPath('data.slug', 'bai-moi')->assertJsonPath('data.is_published', true)->json('data.id');
        $this->assertNotNull(Post::query()->find($id)->published_at);
        $this->postJson('/api/admin/posts', ['title' => 'Bài mới'])->assertCreated()->assertJsonPath('data.slug', 'bai-moi-2');
        $this->postJson('/api/admin/posts', [])->assertUnprocessable()->assertJsonValidationErrors('title');

        $this->putJson("/api/admin/posts/{$id}", ['title' => 'Bài đã sửa', 'is_published' => false])->assertOk()->assertJsonPath('data.is_published', false);
        $this->getJson('/api/posts/bai-moi')->assertNotFound();
        $this->getJson('/api/admin/posts?q=sửa')->assertOk()->assertJsonCount(1, 'data');

        $this->deleteJson("/api/admin/posts/{$id}")->assertOk();
        $this->assertDatabaseMissing('posts', ['id' => $id]);
    }

    public function test_admin_can_upload_post_image(): void
    {
        Storage::fake('public');
        $this->actingAsAdmin();
        $id = $this->postJson('/api/admin/posts', ['title' => 'Có ảnh'])->assertCreated()->json('data.id');

        $response = $this->post("/api/admin/posts/{$id}/image", ['image' => UploadedFile::fake()->image('cover.jpg')], ['Accept' => 'application/json'])->assertOk();

        $this->assertNotNull($response->json('data.image_url'));
        Storage::disk('public')->assertExists(Post::query()->find($id)->image);
    }

    public function test_newsletter_signup_is_validated_and_idempotent(): void
    {
        $this->postJson('/api/newsletter', ['email' => 'khong-hop-le'])->assertUnprocessable()->assertJsonValidationErrors('email');

        $this->postJson('/api/newsletter', ['email' => 'Khach@Example.com'])->assertCreated();
        $this->postJson('/api/newsletter', ['email' => 'khach@example.com'])->assertCreated();

        $this->assertSame(1, NewsletterSubscriber::query()->count());
        $this->assertDatabaseHas('newsletter_subscribers', ['email' => 'khach@example.com', 'is_active' => true]);
    }

    public function test_admin_lists_and_removes_newsletter_subscribers(): void
    {
        $subscriber = NewsletterSubscriber::query()->create(['email' => 'a@example.com']);
        NewsletterSubscriber::query()->create(['email' => 'b@example.com']);

        $this->actingAsCustomer();
        $this->getJson('/api/admin/newsletter-subscribers')->assertForbidden();

        $this->actingAsAdmin();
        $this->getJson('/api/admin/newsletter-subscribers')->assertOk()->assertJsonCount(2, 'data');
        $this->getJson('/api/admin/newsletter-subscribers?q=a@')->assertOk()->assertJsonCount(1, 'data');
        $this->deleteJson("/api/admin/newsletter-subscribers/{$subscriber->id}")->assertOk();
        $this->assertDatabaseMissing('newsletter_subscribers', ['id' => $subscriber->id]);
    }

    public function test_banners_can_be_filtered_by_position_and_managed_by_admin(): void
    {
        Banner::query()->create(['title' => 'Hero', 'position' => 'hero']);
        Banner::query()->create(['title' => 'Nữ', 'position' => 'collection', 'sort_order' => 1]);
        Banner::query()->create(['title' => 'Ẩn', 'position' => 'collection', 'is_active' => false]);

        $this->getJson('/api/banners')->assertOk()->assertJsonCount(2, 'data');
        $this->getJson('/api/banners?position=collection')->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.title', 'Nữ');
        $this->getJson('/api/banners?position=khac')->assertUnprocessable();

        $this->actingAsAdmin();
        $this->postJson('/api/admin/banners', ['title' => 'Túi', 'position' => 'collection'])->assertCreated()->assertJsonPath('data.position', 'collection');
        $this->postJson('/api/admin/banners', ['title' => 'Sai', 'position' => 'footer'])->assertUnprocessable()->assertJsonValidationErrors('position');
        $this->getJson('/api/admin/banners?position=collection')->assertOk()->assertJsonCount(3, 'data');
    }

    public function test_featured_reviews_only_include_visible_good_reviews_with_comment(): void
    {
        $variant = $this->makeVariant(20);
        $product = $variant->product;
        $user = $this->actingAsCustomer();
        foreach (range(1, 5) as $ignored) {
            $this->addToCart($variant);
            $this->placeOrder();
        }
        $itemIds = OrderItem::query()->pluck('id')->all();
        $make = function (array $attributes) use ($user, $product, &$itemIds) {
            return Review::query()->create(['user_id' => $user->id, 'product_id' => $product->id, 'order_item_id' => array_shift($itemIds), ...$attributes]);
        };
        $make(['rating' => 5, 'comment' => 'Rất đẹp', 'is_visible' => true]);
        $make(['rating' => 4, 'comment' => 'Khá ổn', 'is_visible' => true]);
        $make(['rating' => 3, 'comment' => 'Bình thường', 'is_visible' => true]);
        $make(['rating' => 5, 'comment' => 'Bị ẩn', 'is_visible' => false]);
        $make(['rating' => 5, 'comment' => null, 'is_visible' => true]);

        $response = $this->getJson('/api/reviews/featured')->assertOk()->assertJsonCount(2, 'data');

        $this->assertSame(['Rất đẹp', 'Khá ổn'], $response->json('data.*.comment'));
        $response->assertJsonPath('data.0.user.name', fn ($name) => is_string($name))->assertJsonPath('data.0.product.slug', $product->slug);
    }
}
