<?php

namespace Database\Seeders;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;

/**
 * Danh mục, thương hiệu và sản phẩm Apple mẫu. Dữ liệu nằm trong data/catalog.json,
 * cùng tệp mà scripts/generate-product-art.mjs dùng để sinh ảnh minh họa trong frontend/public/images.
 */
class CatalogSeeder extends Seeder
{
    public function run(): void
    {
        $data = json_decode(file_get_contents(database_path('seeders/data/catalog.json')), true, 512, JSON_THROW_ON_ERROR);

        $categories = $this->categories($data['categories']);
        $brands = $this->brands($data['brands']);

        $position = 0;
        foreach ($data['products'] as $item) {
            $position = $this->product($item, $categories, $brands, $position);
        }
    }

    /** @return array<string, Category> */
    private function categories(array $items): array
    {
        $result = [];
        foreach ($items as $item) {
            $result[$item['slug']] = Category::query()->updateOrCreate(['slug' => $item['slug']], [
                'name' => $item['name'],
                'description' => $item['description'] ?? null,
                'sort_order' => $item['order'],
                'is_active' => true,
                'parent_id' => isset($item['parent']) ? $result[$item['parent']]->id : null,
            ]);
        }

        return $result;
    }

    /** @return array<string, Brand> */
    private function brands(array $items): array
    {
        $result = [];
        foreach ($items as $index => $item) {
            $result[$item['slug']] = Brand::query()->updateOrCreate(['slug' => $item['slug']], [
                'name' => $item['name'], 'description' => $item['description'] ?? null, 'is_active' => true, 'sort_order' => $index + 1,
            ]);
        }

        return $result;
    }

    /** Tạo sản phẩm cùng ảnh và các phiên bản (cấu hình × màu); trả về bộ đếm để sinh tồn kho ổn định. */
    private function product(array $item, array $categories, array $brands, int $position): int
    {
        $extension = in_array($item['slug'], ['iphone-17-pro-max','iphone-17','iphone-air','iphone-16','macbook-air-13-m4','macbook-air-15-m4','macbook-pro-14-m4','ipad-air-11-m3','ipad-a16','apple-watch-series-10','airpods-pro-3'], true) ? 'png' : 'svg';
        $hero = fn (array $color) => "/images/products/{$item['slug']}-".strtolower($color['key']).'.'.$extension;

        $product = Product::query()->updateOrCreate(['slug' => $item['slug']], [
            'code' => $item['code'],
            'name' => $item['name'],
            'tagline' => $item['tagline'],
            'description' => $item['description'],
            'category_id' => $categories[$item['category']]->id,
            'brand_id' => $brands[$item['brand']]->id,
            'price' => $item['price'],
            'compare_at_price' => $item['compare_at'] ?? null,
            'thumbnail' => $hero($item['colors'][0]),
            'option_label' => $item['option_label'],
            'highlights' => $item['highlights'],
            'specs' => array_map(fn (array $row) => ['label' => $row[0], 'value' => $row[1]], $item['specs']),
            'in_the_box' => $item['in_the_box'],
            'warranty' => $item['warranty'],
            'collections' => $item['collections'],
            'status' => Product::STATUS_ACTIVE,
            'is_new' => $item['is_new'],
            'is_featured' => $item['is_featured'],
        ]);

        $product->images()->delete();
        $product->images()->create(['url' => "/images/products/{$item['slug']}-detail.{$extension}", 'sort_order' => 1]);

        foreach ($item['configurations'] as $configuration) {
            foreach ($item['colors'] as $color) {
                $position++;
                $product->variants()->updateOrCreate(
                    ['sku' => strtoupper("{$item['code']}-{$configuration['key']}-{$color['key']}")],
                    [
                        'configuration' => $configuration['label'],
                        'color' => $color['name'],
                        'color_hex' => $color['hex'],
                        // Giá riêng chỉ lưu khi khác giá bán chung của sản phẩm.
                        'price' => (float) $configuration['price'] === (float) $item['price'] ? null : $configuration['price'],
                        'stock' => $this->stock($position),
                        'image' => $hero($color),
                        'is_active' => true,
                    ],
                );
            }
        }

        return $position;
    }

    /** Tồn kho xác định để dữ liệu mẫu giống nhau mỗi lần nạp: phần lớn dồi dào, vài phiên bản sắp hết hoặc hết hàng. */
    private function stock(int $position): int
    {
        if ($position % 29 === 0) {
            return 0;
        }

        return $position % 17 === 0 ? 3 : 6 + ($position * 11) % 20;
    }
}
