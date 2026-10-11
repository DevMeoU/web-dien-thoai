<?php

namespace App\Repositories;

use App\Interfaces\ProductVariantRepositoryInterface;
use App\Models\OrderItem;
use App\Models\ProductVariant;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class ProductVariantRepository extends BaseRepository implements ProductVariantRepositoryInterface
{
    protected function model(): string
    {
        return ProductVariant::class;
    }

    public function lockForUpdate(array $ids): Collection
    {
        return $this->query()->with('product')->whereIn('id', $ids)->orderBy('id')->lockForUpdate()->get()->keyBy('id');
    }

    public function paginateInventory(array $filters, int $threshold): LengthAwarePaginator
    {
        return $this->query()->with('product:id,name,thumbnail,status')
            ->when($filters['q'] ?? null, fn ($q, $term) => $q->where(fn ($sub) => $sub
                ->where('sku', 'like', "%{$term}%")->orWhereHas('product', fn ($p) => $p->where('name', 'like', "%{$term}%"))))
            ->when($filters['product_id'] ?? null, fn ($q, $id) => $q->where('product_id', $id))
            ->when(($filters['stock_status'] ?? null) === 'out', fn ($q) => $q->where('stock', 0))
            ->when(($filters['stock_status'] ?? null) === 'low', fn ($q) => $q->where('stock', '>', 0)->where('stock', '<=', $threshold))
            ->orderBy('stock')->orderBy('id')
            ->paginate((int) ($filters['per_page'] ?? 20))->withQueryString();
    }

    public function lowStock(int $threshold, int $limit): Collection
    {
        return $this->query()->with('product:id,name')->where('is_active', true)
            ->where('stock', '<=', $threshold)->orderBy('stock')->limit($limit)->get();
    }

    public function hasOrders(ProductVariant $variant): bool
    {
        return OrderItem::query()->where('product_variant_id', $variant->id)->exists();
    }

    public function adjustStock(ProductVariant $variant, int $delta): void
    {
        $delta >= 0 ? $variant->increment('stock', $delta) : $variant->decrement('stock', abs($delta));
    }
}
