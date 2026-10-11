<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\CreatesShopData;
use Tests\TestCase;

class ReviewTest extends TestCase
{
    use CreatesShopData, RefreshDatabase;

    /** Khách mua và nhận hàng (đơn hoàn tất); trả về [khách, id dòng đơn, sản phẩm]. */
    private function completedPurchase(?User $customer = null, ?Product $product = null): array
    {
        $customer = $this->actingAsCustomer($customer);
        $variant = $this->makeVariant(10, 100000, $product ? [] : ['slug' => 'ao-test']);
        if ($product) {
            $variant->product()->associate($product)->save();
        }
        $this->addToCart($variant, 1);
        $code = $this->placeOrder();
        $order = Order::query()->where('code', $code)->first();
        $order->update(['status' => 'completed', 'completed_at' => now()]);

        return [$customer, OrderItem::query()->where('order_id', $order->id)->value('id'), $variant->product];
    }

    public function test_only_completed_purchases_can_be_reviewed(): void
    {
        $this->actingAsCustomer();
        $variant = $this->makeVariant(5);
        $this->addToCart($variant, 1);
        $this->placeOrder();
        $itemId = OrderItem::query()->value('id');

        $this->getJson('/api/reviews/eligible')->assertJsonCount(0, 'data');
        $this->postJson('/api/reviews', ['order_item_id' => $itemId, 'rating' => 5])->assertUnprocessable();

        Order::query()->update(['status' => 'completed']);
        $this->getJson('/api/reviews/eligible')->assertJsonCount(1, 'data')->assertJsonPath('data.0.order_item_id', $itemId);
        $this->postJson('/api/reviews', ['order_item_id' => $itemId, 'rating' => 5, 'comment' => 'Rất đẹp'])->assertCreated()->assertJsonPath('data.rating', 5);
        $this->getJson('/api/reviews/eligible')->assertJsonCount(0, 'data');
    }

    public function test_review_is_one_per_order_item_validated_and_limited_to_buyer(): void
    {
        [, $itemId] = $this->completedPurchase();

        $this->postJson('/api/reviews', ['order_item_id' => $itemId, 'rating' => 6])->assertUnprocessable()->assertJsonValidationErrors('rating');
        $this->postJson('/api/reviews', ['order_item_id' => $itemId])->assertUnprocessable()->assertJsonValidationErrors('rating');
        $this->postJson('/api/reviews', ['order_item_id' => $itemId, 'rating' => 4])->assertCreated();
        $this->postJson('/api/reviews', ['order_item_id' => $itemId, 'rating' => 5])->assertStatus(409);

        $this->actingAsCustomer();
        $this->postJson('/api/reviews', ['order_item_id' => $itemId, 'rating' => 5])->assertForbidden();
    }

    public function test_reviews_update_product_rating_and_can_be_filtered_by_stars(): void
    {
        [, $firstItem, $product] = $this->completedPurchase();
        $this->postJson('/api/reviews', ['order_item_id' => $firstItem, 'rating' => 5, 'comment' => 'Tuyệt'])->assertCreated();
        [, $secondItem] = $this->completedPurchase(null, $product);
        $this->postJson('/api/reviews', ['order_item_id' => $secondItem, 'rating' => 3])->assertCreated();

        $this->assertEquals(4.0, (float) $product->fresh()->rating_avg);
        $this->assertSame(2, $product->fresh()->rating_count);

        $this->getJson('/api/products/ao-test/reviews')->assertOk()
            ->assertJsonPath('data.summary.count', 2)->assertJsonPath('data.summary.average', 4)
            ->assertJsonPath('data.summary.distribution.5', 1)->assertJsonPath('data.summary.distribution.3', 1)
            ->assertJsonCount(2, 'data.reviews.data');
        $this->getJson('/api/products/ao-test/reviews?rating=5')->assertJsonCount(1, 'data.reviews.data');
        $this->getJson('/api/products/ao-test')->assertJsonPath('data.rating_count', 2)->assertJsonPath('data.rating_avg', 4);
    }

    public function test_customer_can_edit_and_delete_only_their_own_review(): void
    {
        [$owner, $itemId, $product] = $this->completedPurchase();
        $reviewId = $this->postJson('/api/reviews', ['order_item_id' => $itemId, 'rating' => 2, 'comment' => 'Tạm'])->json('data.id');

        $this->putJson("/api/reviews/{$reviewId}", ['rating' => 5, 'comment' => 'Đã đổi ý'])->assertOk()->assertJsonPath('data.rating', 5);
        $this->putJson("/api/reviews/{$reviewId}", ['order_item_id' => 1])->assertUnprocessable();
        $this->assertEquals(5.0, (float) $product->fresh()->rating_avg);
        $this->getJson('/api/reviews/mine')->assertJsonCount(1, 'data');

        $this->actingAsCustomer();
        $this->putJson("/api/reviews/{$reviewId}", ['rating' => 1])->assertNotFound();
        $this->deleteJson("/api/reviews/{$reviewId}")->assertNotFound();

        $this->actingAsCustomer($owner);
        $this->deleteJson("/api/reviews/{$reviewId}")->assertOk();
        $this->assertSame(0, $product->fresh()->rating_count);
        $this->assertEquals(0.0, (float) $product->fresh()->rating_avg);
    }

    public function test_admin_can_hide_reviews_and_reply_and_hidden_reviews_leave_the_average(): void
    {
        [, $itemId, $product] = $this->completedPurchase();
        $reviewId = $this->postJson('/api/reviews', ['order_item_id' => $itemId, 'rating' => 1, 'comment' => 'Vi phạm'])->json('data.id');

        $this->actingAsAdmin();
        $this->getJson('/api/admin/reviews?rating=1')->assertJsonCount(1, 'data')->assertJsonPath('data.0.user.email', User::query()->where('role', 'user')->value('email'));
        $this->postJson("/api/admin/reviews/{$reviewId}/reply", ['reply' => 'Cảm ơn góp ý'])->assertOk()->assertJsonPath('data.admin_reply', 'Cảm ơn góp ý');
        $this->postJson("/api/admin/reviews/{$reviewId}/reply", [])->assertUnprocessable();

        $this->patchJson("/api/admin/reviews/{$reviewId}/visibility", ['is_visible' => false])->assertOk()->assertJsonPath('data.is_visible', false);
        $this->assertSame(0, $product->fresh()->rating_count);
        $this->getJson('/api/products/ao-test/reviews')->assertJsonPath('data.summary.count', 0)->assertJsonCount(0, 'data.reviews.data');
        $this->getJson('/api/admin/reviews?is_visible=false')->assertJsonCount(1, 'data');

        $this->patchJson("/api/admin/reviews/{$reviewId}/visibility", ['is_visible' => true])->assertOk();
        $this->assertSame(1, $product->fresh()->rating_count);
    }

    public function test_review_management_requires_admin(): void
    {
        $this->actingAsCustomer();
        $this->getJson('/api/admin/reviews')->assertForbidden();
        $this->patchJson('/api/admin/reviews/1/visibility', ['is_visible' => false])->assertForbidden();
    }
}
