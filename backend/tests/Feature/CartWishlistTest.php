<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\CreatesShopData;
use Tests\TestCase;

class CartWishlistTest extends TestCase
{
    use CreatesShopData, RefreshDatabase;

    public function test_customer_can_add_items_and_quantities_merge_per_variant(): void
    {
        $this->actingAsCustomer();
        $variant = $this->makeVariant(10, 200000);

        $this->postJson('/api/cart/items', ['product_variant_id' => $variant->id, 'quantity' => 2])->assertOk();
        $this->postJson('/api/cart/items', ['product_variant_id' => $variant->id, 'quantity' => 3])
            ->assertOk()->assertJsonCount(1, 'data.items')->assertJsonPath('data.items.0.quantity', 5)
            ->assertJsonPath('data.subtotal', 1000000)->assertJsonPath('data.item_count', 5);
    }

    public function test_cart_rejects_quantity_above_stock_and_unavailable_products(): void
    {
        $this->actingAsCustomer();
        $variant = $this->makeVariant(3);
        $soldOut = $this->makeVariant(0);
        $hidden = $this->makeVariant(5, 100000, ['status' => Product::STATUS_HIDDEN]);

        $this->postJson('/api/cart/items', ['product_variant_id' => $variant->id, 'quantity' => 4])
            ->assertUnprocessable()->assertJsonPath('message', 'Chỉ còn 3 sản phẩm trong kho.');
        $this->postJson('/api/cart/items', ['product_variant_id' => $soldOut->id, 'quantity' => 1])->assertUnprocessable();
        $this->postJson('/api/cart/items', ['product_variant_id' => $hidden->id, 'quantity' => 1])->assertUnprocessable();
        $this->postJson('/api/cart/items', ['product_variant_id' => 999999, 'quantity' => 1])->assertUnprocessable();
        $this->postJson('/api/cart/items', ['product_variant_id' => $variant->id, 'quantity' => 0])->assertUnprocessable();
        $this->getJson('/api/cart')->assertJsonCount(0, 'data.items');
    }

    public function test_customer_can_update_remove_and_clear_items(): void
    {
        $this->actingAsCustomer();
        $first = $this->makeVariant(10);
        $second = $this->makeVariant(10);
        $this->addToCart($first, 1);
        $this->addToCart($second, 1);
        $itemId = $this->getJson('/api/cart')->json('data.items.0.id');

        $this->putJson("/api/cart/items/{$itemId}", ['quantity' => 4])->assertOk()->assertJsonPath('data.items.0.quantity', 4);
        $this->putJson("/api/cart/items/{$itemId}", ['quantity' => 11])->assertUnprocessable();
        $this->deleteJson("/api/cart/items/{$itemId}")->assertOk()->assertJsonCount(1, 'data.items');
        $this->deleteJson('/api/cart')->assertOk()->assertJsonCount(0, 'data.items');
    }

    public function test_cart_is_private_to_each_account_and_flags_items_that_became_unavailable(): void
    {
        $owner = $this->actingAsCustomer();
        $variant = $this->makeVariant(5);
        $this->addToCart($variant, 2);
        $itemId = $this->getJson('/api/cart')->json('data.items.0.id');

        $this->actingAsCustomer();
        $this->getJson('/api/cart')->assertJsonCount(0, 'data.items');
        $this->deleteJson("/api/cart/items/{$itemId}")->assertNotFound();

        $this->actingAsCustomer($owner);
        $variant->update(['stock' => 1]);
        $this->getJson('/api/cart')->assertJsonPath('data.items.0.issue', 'insufficient_stock')->assertJsonPath('data.has_issues', true);
        $variant->product->update(['status' => Product::STATUS_DISCONTINUED]);
        $this->getJson('/api/cart')->assertJsonPath('data.items.0.issue', 'unavailable');
    }

    public function test_wishlist_add_list_remove_and_flags_discontinued_products(): void
    {
        $user = $this->actingAsCustomer();
        $first = Product::factory()->create();
        $second = Product::factory()->create();

        $this->postJson('/api/wishlist', ['product_id' => $first->id])->assertOk()->assertJsonCount(1, 'data');
        $this->postJson('/api/wishlist', ['product_id' => $first->id])->assertOk()->assertJsonCount(1, 'data');
        $this->postJson('/api/wishlist', ['product_id' => $second->id])->assertOk()->assertJsonCount(2, 'data');

        $first->update(['status' => Product::STATUS_DISCONTINUED]);
        $this->getJson('/api/wishlist')->assertOk()->assertJsonCount(2, 'data')
            ->assertJsonFragment(['id' => $first->id, 'status' => 'discontinued']);

        $this->deleteJson("/api/wishlist/{$second->id}")->assertOk()->assertJsonCount(1, 'data');
        $this->assertSame(1, $user->wishlistProducts()->count());
    }

    public function test_wishlist_rejects_unavailable_products_and_is_private(): void
    {
        $this->actingAsCustomer();
        $this->postJson('/api/wishlist', ['product_id' => Product::factory()->hidden()->create()->id])->assertUnprocessable();
        $this->postJson('/api/wishlist', ['product_id' => 999999])->assertUnprocessable();
        $this->postJson('/api/wishlist', ['product_id' => Product::factory()->create()->id])->assertOk();

        $this->actingAsCustomer(User::factory()->create());
        $this->getJson('/api/wishlist')->assertOk()->assertJsonCount(0, 'data');
    }
}
