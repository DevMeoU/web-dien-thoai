<?php

namespace App\Repositories;

use App\Interfaces\BrandRepositoryInterface;
use App\Models\Brand;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;

class BrandRepository extends BaseRepository implements BrandRepositoryInterface
{
    protected function model(): string
    {
        return Brand::class;
    }

    protected function applyFilters(Builder $query, array $filters): void
    {
        $query->withCount('products')
            ->when($filters['q'] ?? null, fn ($q, $term) => $q->where('name', 'like', "%{$term}%"))
            ->when(isset($filters['is_active']), fn ($q) => $q->where('is_active', filter_var($filters['is_active'], FILTER_VALIDATE_BOOLEAN)))
            ->orderBy('sort_order')->orderBy('id');
    }

    public function listActive(): Collection
    {
        return $this->query()->where('is_active', true)->orderBy('sort_order')->orderBy('id')->get();
    }

    public function productCount(Brand $brand): int
    {
        return $brand->products()->count();
    }
}
