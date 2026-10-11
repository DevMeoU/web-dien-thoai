<?php

namespace App\Repositories;

use App\Interfaces\CategoryRepositoryInterface;
use App\Models\Category;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;

class CategoryRepository extends BaseRepository implements CategoryRepositoryInterface
{
    protected function model(): string
    {
        return Category::class;
    }

    protected function applyFilters(Builder $query, array $filters): void
    {
        $query->with('parent:id,name')->withCount('products')
            ->when($filters['q'] ?? null, fn ($q, $term) => $q->where('name', 'like', "%{$term}%"))
            ->when(isset($filters['is_active']), fn ($q) => $q->where('is_active', filter_var($filters['is_active'], FILTER_VALIDATE_BOOLEAN)))
            ->when($filters['parent_id'] ?? null, fn ($q, $parent) => $q->where('parent_id', $parent))
            ->orderBy('sort_order')->orderBy('id');
    }

    public function tree(bool $onlyActive): Collection
    {
        return $this->query()->whereNull('parent_id')
            ->when($onlyActive, fn ($q) => $q->where('is_active', true))
            ->with(['children' => fn ($q) => $q->when($onlyActive, fn ($sub) => $sub->where('is_active', true))])
            ->orderBy('sort_order')->orderBy('id')->get();
    }

    public function productCount(Category $category): int
    {
        return $category->products()->count();
    }

    public function childCount(Category $category): int
    {
        return $category->children()->count();
    }

    public function selfAndDescendantIds(Category $category): array
    {
        return [$category->id, ...$category->children()->pluck('id')->all()];
    }
}
