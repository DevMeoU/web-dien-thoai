<?php

namespace Tests\Feature;

use App\Models\Banner;
use App\Models\Brand;
use App\Models\ContentPage;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\CreatesShopData;
use Tests\TestCase;

class CatalogTest extends TestCase
{
    use CreatesShopData, RefreshDatabase;

    public function test_product_list_filters_by_category_including_children_and_brand(): void
    {
        $parent = $this->makeCategory();
        $child = $this->makeCategory(['parent_id' => $parent->id]);
        $other = $this->makeCategory();
        $brand = Brand::factory()->create();
        Product::factory()->create(['category_id' => $parent->id, 'name' => 'Áo cha']);
        Product::factory()->create(['category_id' => $child->id, 'brand_id' => $brand->id, 'name' => 'Áo con']);
        Product::factory()->create(['category_id' => $other->id, 'name' => 'Váy khác']);

        $this->getJson('/api/products?category='.$parent->slug)->assertOk()->assertJsonCount(2, 'data');
        $this->getJson('/api/products?category='.$other->id)->assertOk()->assertJsonCount(1, 'data');
        $this->getJson('/api/products?brand='.$brand->slug)->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.name', 'Áo con');
    }

    public function test_product_list_filters_by_price_configuration_color_stock_and_sale(): void
    {
        $cheap = $this->makeVariant(5, 100000, ['name' => 'Rẻ'], ['configuration' => '128GB', 'color' => 'Xám']);
        $this->makeVariant(0, 300000, ['name' => 'Hết hàng', 'compare_at_price' => 400000], ['configuration' => '256GB', 'color' => 'Xanh']);
        $this->makeVariant(5, 500000, ['name' => 'Đắt'], ['configuration' => '256GB', 'color' => 'Xám']);

        $this->getJson('/api/products?min_price=200000&max_price=400000')->assertJsonCount(1, 'data')->assertJsonPath('data.0.name', 'Hết hàng');
        $this->getJson('/api/products?configuration=256GB&color=Xám')->assertJsonCount(1, 'data')->assertJsonPath('data.0.name', 'Đắt');
        $this->getJson('/api/products?in_stock=true')->assertJsonCount(2, 'data');
        $this->getJson('/api/products?on_sale=1')->assertJsonCount(1, 'data')->assertJsonPath('data.0.is_on_sale', true)->assertJsonPath('data.0.discount_percent', 25);
        $this->assertSame($cheap->product->name, $this->getJson('/api/products?sort=price_asc')->json('data.0.name'));
        $this->assertSame('Đắt', $this->getJson('/api/products?sort=price-desc')->json('data.0.name'));
    }

    public function test_product_list_paginates_and_searches_by_name(): void
    {
        Product::factory()->count(5)->create();
        Product::factory()->create(['name' => 'Áo khoác len']);

        $this->getJson('/api/products?per_page=2')->assertJsonCount(2, 'data')->assertJsonPath('meta.total', 6);
        $this->getJson('/api/products?q='.urlencode('khoác'))->assertJsonCount(1, 'data');
        $this->getJson('/api/products?q=khongco')->assertOk()->assertJsonCount(0, 'data');
    }

    public function test_product_detail_by_id_or_slug_includes_variants_and_hides_inactive(): void
    {
        $variant = $this->makeVariant(7, 150000, ['slug' => 'ao-len', 'specs' => [['label' => 'Chip', 'value' => 'A19']], 'highlights' => ['Titan'], 'warranty' => '12 tháng'], ['configuration' => '256GB', 'color' => 'Xám']);
        $hidden = Product::factory()->hidden()->create(['slug' => 'an']);
        $discontinued = Product::factory()->discontinued()->create();

        $this->getJson('/api/products/ao-len')->assertOk()
            ->assertJsonPath('data.slug', 'ao-len')->assertJsonPath('data.total_stock', 7)->assertJsonPath('data.in_stock', true)
            ->assertJsonPath('data.variants.0.configuration', '256GB')->assertJsonPath('data.configurations.0', '256GB')
            ->assertJsonPath('data.specs.0.value', 'A19')->assertJsonPath('data.highlights.0', 'Titan')->assertJsonPath('data.warranty', '12 tháng');
        $this->getJson('/api/products/'.$variant->product_id)->assertOk();
        $this->getJson('/api/products/an')->assertNotFound()->assertJsonPath('data', null);
        $this->getJson('/api/products/'.$discontinued->id)->assertNotFound();
    }

    public function test_related_products_share_category_and_exclude_current(): void
    {
        $category = $this->makeCategory();
        $main = Product::factory()->create(['category_id' => $category->id, 'slug' => 'chinh']);
        Product::factory()->count(2)->create(['category_id' => $category->id]);
        Product::factory()->create();

        $response = $this->getJson('/api/products/chinh/related')->assertOk()->assertJsonCount(2, 'data');
        $this->assertNotContains($main->id, array_column($response->json('data'), 'id'));
    }

    public function test_public_taxonomy_endpoints_return_only_active_entries(): void
    {
        $parent = $this->makeCategory(['name' => 'Áo']);
        $this->makeCategory(['parent_id' => $parent->id, 'name' => 'Áo khoác']);
        $this->makeCategory(['parent_id' => $parent->id, 'name' => 'Ẩn', 'is_active' => false]);
        $this->makeCategory(['is_active' => false]);
        Brand::factory()->create(['is_active' => false]);
        Brand::factory()->create();
        Banner::query()->create(['title' => 'Bật', 'sort_order' => 2]);
        Banner::query()->create(['title' => 'Tắt', 'is_active' => false]);

        $this->getJson('/api/categories')->assertOk()->assertJsonCount(1, 'data')->assertJsonCount(1, 'data.0.children');
        $this->getJson('/api/brands')->assertJsonCount(1, 'data');
        $this->getJson('/api/banners')->assertJsonCount(1, 'data')->assertJsonPath('data.0.title', 'Bật');
    }

    public function test_public_settings_hide_internal_configuration_and_pages_only_show_published(): void
    {
        ContentPage::query()->create(['slug' => 'privacy', 'title' => 'Bảo mật', 'content' => 'Nội dung']);
        ContentPage::query()->create(['slug' => 'draft', 'title' => 'Nháp', 'is_published' => false]);

        $this->getJson('/api/settings')->assertOk()
            ->assertJsonPath('data.store_name', 'Mela')->assertJsonMissingPath('data.low_stock_threshold');
        $this->getJson('/api/pages')->assertJsonCount(1, 'data');
        $this->getJson('/api/pages/privacy')->assertOk()->assertJsonPath('data.title', 'Bảo mật');
        $this->getJson('/api/pages/draft')->assertNotFound();
    }

    public function test_variant_effective_price_falls_back_to_product_price(): void
    {
        $variant = $this->makeVariant(3, 100000);
        $special = ProductVariant::factory()->create(['product_id' => $variant->product_id, 'price' => 90000, 'configuration' => '1TB', 'color' => 'Đỏ']);

        $this->assertSame('100000.00', $variant->fresh()->effective_price);
        $this->assertSame('90000.00', $special->effective_price);
    }

    public function test_product_list_can_sort_by_best_selling_ignoring_cancelled_orders(): void
    {
        $this->actingAsCustomer();
        $few = $this->makeVariant(10, 100000, ['name' => 'Bán ít']);
        $many = $this->makeVariant(10, 100000, ['name' => 'Bán nhiều']);
        $cancelled = $this->makeVariant(10, 100000, ['name' => 'Bị hủy']);
        $this->addToCart($few, 1);
        $this->placeOrder();
        $this->addToCart($many, 3);
        $this->placeOrder();
        $this->addToCart($cancelled, 5);
        $code = $this->placeOrder();
        $this->postJson("/api/orders/{$code}/cancel", ['reason' => 'Đổi ý không mua nữa'])->assertOk();

        $names = $this->getJson('/api/products?sort=best_selling')->assertOk()->json('data.*.name');

        $this->assertSame(['Bán nhiều', 'Bán ít', 'Bị hủy'], $names);
    }
}
