<?php

namespace Tests\Concerns;

use App\Models\Category;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

/** Tạo nhanh dữ liệu cửa hàng và thực hiện các bước đặt hàng cho test. */
trait CreatesShopData
{
    protected function admin(): User
    {
        return User::factory()->admin()->create();
    }

    protected function actingAsAdmin(): User
    {
        return Sanctum::actingAs($this->admin());
    }

    protected function actingAsCustomer(?User $user = null): User
    {
        return Sanctum::actingAs($user ?? User::factory()->create());
    }

    /** Tạo sản phẩm đang bán với một phiên bản (cấu hình/màu). */
    protected function makeVariant(int $stock = 10, int $price = 200000, array $product = [], array $variant = []): ProductVariant
    {
        $model = Product::factory()->create(['price' => $price, ...$product]);

        return ProductVariant::factory()->create(['product_id' => $model->id, 'stock' => $stock, ...$variant]);
    }

    protected function makeCategory(array $attributes = []): Category
    {
        return Category::factory()->create($attributes);
    }

    protected function addressPayload(array $overrides = []): array
    {
        return [
            'recipient_name' => 'Nguyễn Văn A',
            'phone' => '0901234567',
            'city' => 'TP. Hồ Chí Minh',
            'district' => 'Quận 1',
            'ward' => 'Phường Bến Nghé',
            'line' => '12 Lê Lợi',
            ...$overrides,
        ];
    }

    /** Thêm sản phẩm vào giỏ qua API (người dùng hiện tại đã đăng nhập). */
    protected function addToCart(ProductVariant $variant, int $quantity = 1): void
    {
        $this->postJson('/api/cart/items', ['product_variant_id' => $variant->id, 'quantity' => $quantity])->assertOk();
    }

    /** Đặt hàng qua API với địa chỉ nhập mới; trả về mã đơn. */
    protected function placeOrder(array $extra = []): string
    {
        return $this->postJson('/api/orders', ['address' => $this->addressPayload(), ...$extra])
            ->assertCreated()->json('data.code');
    }
}
