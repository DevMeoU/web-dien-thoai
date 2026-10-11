<?php

namespace Tests\Feature;

use App\Models\Brand;
use App\Models\ContentPage;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\Concerns\CreatesShopData;
use Tests\TestCase;

class AdminCatalogTest extends TestCase
{
    use CreatesShopData, RefreshDatabase;

    public function test_catalog_management_requires_admin_role(): void
    {
        $this->postJson('/api/admin/products', [])->assertUnauthorized();
        $this->actingAsCustomer();
        $this->postJson('/api/admin/products', ['name' => 'x', 'price' => 1])->assertForbidden();
        $this->postJson('/api/admin/categories', ['name' => 'x'])->assertForbidden();
        $this->deleteJson('/api/admin/brands/1')->assertForbidden();
    }

    public function test_admin_can_create_product_with_variants_and_gets_generated_slug_and_code(): void
    {
        $this->actingAsAdmin();
        $category = $this->makeCategory();
        $brand = Brand::factory()->create();

        $response = $this->postJson('/api/admin/products', [
            'name' => 'iPhone 17 Pro', 'price' => 34990000, 'compare_at_price' => 36990000,
            'category_id' => $category->id, 'brand_id' => $brand->id, 'is_new' => true, 'collections' => ['creative'],
            'tagline' => 'Mạnh mẽ vượt trội.', 'option_label' => 'Dung lượng', 'warranty' => 'Bảo hành chính hãng 12 tháng',
            'in_the_box' => 'Cáp USB-C, sách hướng dẫn', 'highlights' => ['Chip A19 Pro', 'Camera 48MP'],
            'specs' => [['label' => 'Màn hình', 'value' => '6.3 inch Super Retina XDR'], ['label' => 'Chip', 'value' => 'A19 Pro']],
            'variants' => [
                ['sku' => 'IP17P-256-CAM', 'configuration' => '256GB', 'color' => 'Cam Vũ Trụ', 'stock' => 5],
                ['sku' => 'IP17P-512-CAM', 'configuration' => '512GB', 'color' => 'Cam Vũ Trụ', 'stock' => 3, 'price' => 40990000],
            ],
        ])->assertCreated()
            ->assertJsonPath('data.slug', 'iphone-17-pro')->assertJsonPath('data.total_stock', 8)
            ->assertJsonPath('data.is_on_sale', true)->assertJsonCount(2, 'data.variants')
            ->assertJsonPath('data.specs.1.label', 'Chip')->assertJsonPath('data.highlights.0', 'Chip A19 Pro')
            ->assertJsonPath('data.option_label', 'Dung lượng')->assertJsonPath('data.warranty', 'Bảo hành chính hãng 12 tháng');

        $this->assertMatchesRegularExpression('/^SP\d{5}$/', $response->json('data.code'));
        $this->postJson('/api/admin/products', ['name' => 'iPhone 17 Pro', 'price' => 1])->assertCreated()->assertJsonPath('data.slug', 'iphone-17-pro-2');
    }

    public function test_product_validation_rejects_bad_input_and_duplicate_sku_or_code(): void
    {
        $this->actingAsAdmin();
        $this->makeVariant(1, 100, ['code' => 'SP-X'], ['sku' => 'DUP']);

        $this->postJson('/api/admin/products', [])->assertUnprocessable()->assertJsonValidationErrors(['name', 'price']);
        $this->postJson('/api/admin/products', ['name' => 'A', 'price' => -5])->assertUnprocessable()->assertJsonValidationErrors('price');
        $this->postJson('/api/admin/products', ['name' => 'A', 'price' => 5, 'code' => 'SP-X'])->assertUnprocessable()->assertJsonValidationErrors('code');
        $this->postJson('/api/admin/products', ['name' => 'A', 'price' => 5, 'status' => 'weird'])->assertUnprocessable()->assertJsonValidationErrors('status');
        $this->postJson('/api/admin/products', ['name' => 'A', 'price' => 5, 'variants' => [['sku' => 'DUP', 'stock' => 1]]])->assertUnprocessable()->assertJsonValidationErrors('variants.0.sku');
        $this->postJson('/api/admin/products', ['name' => 'A', 'price' => 5, 'variants' => [['sku' => 'N1', 'stock' => -1]]])->assertUnprocessable()->assertJsonValidationErrors('variants.0.stock');
        // Thông số kỹ thuật phải là danh sách cặp nhãn - giá trị đầy đủ.
        $this->postJson('/api/admin/products', ['name' => 'A', 'price' => 5, 'specs' => [['label' => 'Chip']]])->assertUnprocessable()->assertJsonValidationErrors('specs.0.value');
        $this->postJson('/api/admin/products', ['name' => 'A', 'price' => 5, 'highlights' => 'không phải danh sách'])->assertUnprocessable()->assertJsonValidationErrors('highlights');
    }

    public function test_admin_can_update_search_and_change_product_status(): void
    {
        $this->actingAsAdmin();
        $variant = $this->makeVariant(5, 100000, ['name' => 'Áo cũ']);
        $id = $variant->product_id;

        $this->putJson("/api/admin/products/{$id}", ['name' => 'Áo mới', 'price' => 120000, 'is_featured' => true])
            ->assertOk()->assertJsonPath('data.name', 'Áo mới')->assertJsonPath('data.price', '120000.00')->assertJsonPath('data.is_featured', true);
        $this->getJson('/api/admin/products?q=mới')->assertJsonCount(1, 'data');

        $this->patchJson("/api/admin/products/{$id}/status", ['status' => 'hidden'])->assertOk()->assertJsonPath('data.status', 'hidden');
        $this->getJson("/api/products/{$id}")->assertNotFound();
        $this->getJson('/api/admin/products?status=hidden')->assertJsonCount(1, 'data');
        $this->patchJson("/api/admin/products/{$id}/status", ['status' => 'bad'])->assertUnprocessable();
    }

    public function test_product_with_orders_cannot_be_deleted_but_unsold_product_can(): void
    {
        $this->actingAsCustomer();
        $sold = $this->makeVariant(5);
        $this->addToCart($sold, 1);
        $this->placeOrder();
        $unsold = $this->makeVariant(5);

        $this->actingAsAdmin();
        $this->deleteJson("/api/admin/products/{$sold->product_id}")->assertStatus(409);
        $this->deleteJson("/api/admin/variants/{$sold->id}")->assertStatus(409);
        $this->assertDatabaseHas('products', ['id' => $sold->product_id]);

        $this->deleteJson("/api/admin/products/{$unsold->product_id}")->assertOk();
        $this->assertDatabaseMissing('products', ['id' => $unsold->product_id]);
        $this->assertDatabaseMissing('product_variants', ['id' => $unsold->id]);
    }

    public function test_variants_and_stock_can_be_managed_and_stock_can_never_be_negative(): void
    {
        $this->actingAsAdmin();
        $product = Product::factory()->create();

        $id = $this->postJson("/api/admin/products/{$product->id}/variants", ['sku' => 'V-1', 'configuration' => '256GB', 'color' => 'Xanh Dương', 'stock' => 4])
            ->assertCreated()->assertJsonPath('data.stock', 4)->json('data.id');
        $this->postJson("/api/admin/products/{$product->id}/variants", ['sku' => 'V-1', 'stock' => 1])->assertUnprocessable();
        $this->postJson("/api/admin/products/{$product->id}/variants", ['sku' => 'V-2', 'configuration' => '256GB', 'color' => 'Xanh Dương', 'stock' => 1])->assertStatus(409);

        $this->putJson("/api/admin/variants/{$id}", ['price' => 99000, 'is_active' => false])->assertOk()->assertJsonPath('data.is_active', false);
        $this->patchJson("/api/admin/inventory/{$id}", ['stock' => 25])->assertOk()->assertJsonPath('data.stock', 25);
        $this->patchJson("/api/admin/inventory/{$id}", ['stock' => -1])->assertUnprocessable()->assertJsonValidationErrors('stock');
        $this->assertSame(25, ProductVariant::query()->find($id)->stock);
        $this->deleteJson("/api/admin/variants/{$id}")->assertOk();
    }

    public function test_inventory_list_reports_low_and_out_of_stock(): void
    {
        $this->actingAsAdmin();
        $this->makeVariant(0, 1, [], ['sku' => 'OUT']);
        $this->makeVariant(3, 1, [], ['sku' => 'LOW']);
        $this->makeVariant(50, 1, [], ['sku' => 'FINE']);

        $this->getJson('/api/admin/inventory?stock_status=out')->assertJsonCount(1, 'data')->assertJsonPath('data.0.sku', 'OUT');
        $this->getJson('/api/admin/inventory?stock_status=low')->assertJsonCount(1, 'data')->assertJsonPath('data.0.sku', 'LOW');
        $this->getJson('/api/admin/inventory?q=FINE')->assertJsonCount(1, 'data');
        $this->getJson('/api/admin/inventory')->assertJsonCount(3, 'data')->assertJsonPath('data.0.sku', 'OUT');
    }

    public function test_category_rules_two_levels_slug_and_delete_protection(): void
    {
        $this->actingAsAdmin();
        $parent = $this->postJson('/api/admin/categories', ['name' => 'Áo', 'sort_order' => 1])->assertCreated()->assertJsonPath('data.slug', 'ao')->json('data.id');
        $child = $this->postJson('/api/admin/categories', ['name' => 'Áo khoác', 'parent_id' => $parent])->assertCreated()->json('data.id');

        $this->postJson('/api/admin/categories', ['name' => 'Quá sâu', 'parent_id' => $child])->assertUnprocessable();
        $this->putJson("/api/admin/categories/{$parent}", ['parent_id' => $parent])->assertUnprocessable();
        $this->putJson("/api/admin/categories/{$parent}", ['parent_id' => $child])->assertUnprocessable();
        $this->getJson('/api/admin/categories?q=khoác')->assertJsonCount(1, 'data');

        Product::factory()->create(['category_id' => $child]);
        $this->deleteJson("/api/admin/categories/{$child}")->assertStatus(409);
        $this->deleteJson("/api/admin/categories/{$parent}")->assertStatus(409);

        $empty = $this->makeCategory();
        $this->deleteJson("/api/admin/categories/{$empty->id}")->assertOk();
    }

    public function test_brand_crud_and_delete_protection(): void
    {
        $this->actingAsAdmin();
        $id = $this->postJson('/api/admin/brands', ['name' => 'Nhã Studio'])->assertCreated()->assertJsonPath('data.slug', 'nha-studio')->json('data.id');
        $this->putJson("/api/admin/brands/{$id}", ['is_active' => false])->assertOk()->assertJsonPath('data.is_active', false);
        $this->postJson('/api/admin/brands', [])->assertUnprocessable()->assertJsonValidationErrors('name');

        Product::factory()->create(['brand_id' => $id]);
        $this->deleteJson("/api/admin/brands/{$id}")->assertStatus(409);
        Product::query()->update(['brand_id' => null]);
        $this->deleteJson("/api/admin/brands/{$id}")->assertOk();
    }

    public function test_images_can_be_uploaded_and_removed_and_files_are_validated(): void
    {
        Storage::fake('public');
        $this->actingAsAdmin();
        $product = Product::factory()->create();

        $this->postJson("/api/admin/products/{$product->id}/thumbnail", ['image' => UploadedFile::fake()->image('a.jpg')])
            ->assertOk()->assertJsonStructure(['data' => ['thumbnail_url']]);
        $path = $product->fresh()->thumbnail;
        Storage::disk('public')->assertExists($path);

        $imageId = $this->postJson("/api/admin/products/{$product->id}/images", ['image' => UploadedFile::fake()->image('b.png')])
            ->assertCreated()->assertJsonCount(1, 'data.images')->json('data.images.0.id');
        $this->deleteJson("/api/admin/products/{$product->id}/images/{$imageId}")->assertOk()->assertJsonCount(0, 'data.images');

        $this->postJson("/api/admin/products/{$product->id}/images", ['image' => UploadedFile::fake()->create('x.pdf', 10, 'application/pdf')])
            ->assertUnprocessable()->assertJsonValidationErrors('image');
        $this->postJson("/api/admin/products/{$product->id}/images", [])->assertUnprocessable();
    }

    public function test_banners_and_content_can_be_managed(): void
    {
        Storage::fake('public');
        $this->actingAsAdmin();
        $id = $this->postJson('/api/admin/banners', ['title' => 'Mùa thu', 'link' => '/products', 'sort_order' => 1])->assertCreated()->json('data.id');
        $this->postJson("/api/admin/banners/{$id}/image", ['image' => UploadedFile::fake()->image('b.jpg')])->assertOk()->assertJsonStructure(['data' => ['image_url']]);
        $this->putJson("/api/admin/banners/{$id}", ['is_active' => false])->assertOk();
        $this->getJson('/api/banners')->assertJsonCount(0, 'data');
        $this->deleteJson("/api/admin/banners/{$id}")->assertOk();

        $this->putJson('/api/admin/settings', ['contact_phone' => '0901234567', 'free_shipping_threshold' => 500000, 'shipping_fee' => 20000])
            ->assertOk()->assertJsonPath('data.contact_phone', '0901234567');
        $this->getJson('/api/settings')->assertJsonPath('data.shipping_fee', '20000')->assertJsonPath('data.contact_phone', '0901234567');
        $this->putJson('/api/admin/settings', ['shipping_fee' => -1])->assertUnprocessable();

        ContentPage::query()->create(['slug' => 'shipping-policy', 'title' => 'Giao hàng']);
        $this->putJson('/api/admin/pages/shipping-policy', ['content' => 'Giao trong 3 ngày', 'is_published' => true])->assertOk();
        $this->getJson('/api/pages/shipping-policy')->assertOk()->assertJsonPath('data.content', 'Giao trong 3 ngày');
        $this->getJson('/api/admin/pages')->assertOk()->assertJsonCount(1, 'data');
        $this->putJson('/api/admin/pages/missing', ['title' => 'x'])->assertNotFound();
    }

    public function test_shipping_settings_change_the_checkout_total(): void
    {
        $this->actingAsAdmin();
        $this->putJson('/api/admin/settings', ['shipping_fee' => 15000, 'free_shipping_threshold' => 300000])->assertOk();

        $this->actingAsCustomer();
        $variant = $this->makeVariant(10, 100000);
        $this->addToCart($variant, 1);
        $this->postJson('/api/checkout/preview')->assertJsonPath('data.shipping_fee', 15000)->assertJsonPath('data.total', 115000);
        $this->addToCart($variant, 2);
        $this->postJson('/api/checkout/preview')->assertJsonPath('data.shipping_fee', 0);
    }
}
