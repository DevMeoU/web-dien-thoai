<?php

namespace App\Repositories;

use App\Interfaces\BannerRepositoryInterface;
use App\Models\Banner;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;

class BannerRepository extends BaseRepository implements BannerRepositoryInterface
{
    protected function model(): string
    {
        return Banner::class;
    }

    protected function applyFilters(Builder $query, array $filters): void
    {
        $query
            ->when($filters['q'] ?? null, fn ($q, $term) => $q->where('title', 'like', "%{$term}%"))
            ->when($filters['position'] ?? null, fn ($q, $position) => $q->where('position', $position))
            ->when(isset($filters['is_active']), fn ($q) => $q->where('is_active', filter_var($filters['is_active'], FILTER_VALIDATE_BOOLEAN)))
            ->orderBy('sort_order')->orderBy('id');
    }

    public function listActive(?string $position = null): Collection
    {
        return $this->query()->where('is_active', true)->when($position, fn ($q) => $q->where('position', $position))->orderBy('sort_order')->orderBy('id')->get();
    }
}
