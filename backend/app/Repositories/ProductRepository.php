<?php

namespace App\Repositories;

use App\Interfaces\ProductRepositoryInterface;
use App\Models\Category;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;

class ProductRepository extends BaseRepository implements ProductRepositoryInterface
{
    protected function model(): string
    {
        return Product::class;
    }

    public function paginatePublic(array $filters): LengthAwarePaginator
    {
        $query = $this->query()->active()->with(['category', 'brand', 'variants' => fn ($q) => $q->where('is_active', true)]);
        $this->applyFilters($query, $filters);
        $this->applySort($query, $filters['sort'] ?? 'newest');

        return $query->paginate((int) ($filters['per_page'] ?? 12))->withQueryString();
    }

    public function paginateAdmin(array $filters): LengthAwarePaginator
    {
        $query = $this->query()->with(['category', 'brand', 'variants']);
        $this->applyFilters($query, $filters);
        $query->when($filters['status'] ?? null, fn ($q, $status) => $q->where('status', $status));
        $this->applySort($query, $filters['sort'] ?? 'newest');

        return $query->paginate((int) ($filters['per_page'] ?? 15))->withQueryString();
    }

    protected function applyFilters(Builder $query, array $filters): void
    {
        $term = $filters['q'] ?? $filters['search'] ?? null;
        $query
            ->when($term, fn ($q) => $q->where(fn ($sub) => $sub->where('name', 'like', "%{$term}%")->orWhere('code', 'like', "%{$term}%")))
            ->when($filters['category'] ?? null, function ($q, $value) {
                $category = Category::query()->where(ctype_digit((string) $value) ? 'id' : 'slug', $value)->first();
                $q->whereIn('category_id', $category ? [$category->id, ...$category->children()->pluck('id')->all()] : [0]);
            })
            ->when($filters['brand'] ?? null, fn ($q, $value) => $q->whereHas('brand', fn ($b) => $b->where(ctype_digit((string) $value) ? 'id' : 'slug', $value)))
            ->when($filters['collection'] ?? null, fn ($q, $value) => $q->whereJsonContains('collections', $value))
            ->when(isset($filters['min_price']), fn ($q) => $q->where('price', '>=', $filters['min_price']))
            ->when(isset($filters['max_price']), fn ($q) => $q->where('price', '<=', $filters['max_price']))
            ->when(($filters['configuration'] ?? null) || ($filters['color'] ?? null), fn ($q) => $q->whereHas('variants', fn ($v) => $v
                ->where('is_active', true)
                ->when($filters['configuration'] ?? null, fn ($s, $configuration) => $s->where('configuration', $configuration))
                ->when($filters['color'] ?? null, fn ($s, $color) => $s->where('color', $color))))
            ->when($this->flag($filters, 'in_stock'), fn ($q) => $q->whereHas('variants', fn ($v) => $v->where('is_active', true)->where('stock', '>', 0)))
            ->when($this->flag($filters, 'is_new'), fn ($q) => $q->where('is_new', true))
            ->when($this->flag($filters, 'is_featured'), fn ($q) => $q->where('is_featured', true))
            ->when($this->flag($filters, 'on_sale'), fn ($q) => $q->whereNotNull('compare_at_price')->whereColumn('compare_at_price', '>', 'price'));
    }

    private function flag(array $filters, string $key): bool
    {
        return filter_var($filters[$key] ?? false, FILTER_VALIDATE_BOOLEAN);
    }

    private function applySort(Builder $query, string $sort): void
    {
        match (str_replace('-', '_', $sort)) {
            'price_asc' => $query->orderBy('price')->orderBy('id'),
            'price_desc' => $query->orderByDesc('price')->orderBy('id'),
            'name' => $query->orderBy('name'),
            'rating' => $query->orderByDesc('rating_avg')->orderByDesc('rating_count'),
            'best_selling' => $query->orderByDesc($this->soldQuantity())->orderByDesc('id'),
            default => $query->latest('id'),
        };
    }

    /** Tổng số lượng đã bán của sản phẩm, không tính đơn đã hủy. */
    private function soldQuantity(): \Illuminate\Database\Query\Builder
    {
        return OrderItem::query()->toBase()
            ->selectRaw('COALESCE(SUM(order_items.quantity), 0)')
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->whereColumn('order_items.product_id', 'products.id')
            ->where('orders.status', '!=', 'cancelled');
    }

    public function findActiveByKey(string $key): ?Product
    {
        return $this->query()->active()
            ->with(['category', 'brand', 'images', 'variants' => fn ($q) => $q->where('is_active', true)])
            ->where(ctype_digit($key) ? 'id' : 'slug', $key)
            ->first();
    }

    public function loadDetail(Product $product): Product
    {
        return $product->load(['category', 'brand', 'images', 'variants']);
    }

    public function related(Product $product, int $limit): Collection
    {
        return $this->query()->active()->with(['category', 'brand', 'variants'])
            ->whereKeyNot($product->id)
            ->when($product->category_id, fn ($q, $category) => $q->where('category_id', $category))
            ->latest('id')->limit($limit)->get();
    }

    public function hasOrders(Product $product): bool
    {
        return OrderItem::query()->where('product_id', $product->id)->exists();
    }

    public function addImage(Product $product, string $url): ProductImage
    {
        return $product->images()->create(['url' => $url, 'sort_order' => (int) $product->images()->max('sort_order') + 1]);
    }

    public function findImage(Product $product, int $imageId): ?ProductImage
    {
        return $product->images()->whereKey($imageId)->first();
    }

    public function deleteImage(ProductImage $image): void
    {
        $image->delete();
    }

    public function updateRating(Product $product, float $average, int $count): void
    {
        $product->forceFill(['rating_avg' => round($average, 2), 'rating_count' => $count])->save();
    }
}
