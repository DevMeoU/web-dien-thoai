<?php

namespace App\Repositories;

use App\Interfaces\PostRepositoryInterface;
use App\Models\Post;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;

class PostRepository extends BaseRepository implements PostRepositoryInterface
{
    protected function model(): string
    {
        return Post::class;
    }

    protected function applyFilters(Builder $query, array $filters): void
    {
        $query
            ->when($filters['q'] ?? null, fn ($q, $term) => $q->where(fn ($sub) => $sub->where('title', 'like', "%{$term}%")->orWhere('excerpt', 'like', "%{$term}%")))
            ->when(isset($filters['is_active']), fn ($q) => $q->where('is_published', filter_var($filters['is_active'], FILTER_VALIDATE_BOOLEAN)))
            ->orderByDesc('published_at')->orderByDesc('id');
    }

    public function paginatePublished(array $filters): LengthAwarePaginator
    {
        $query = $this->query()->published();
        $this->applyFilters($query, ['q' => $filters['q'] ?? null]);

        return $query->paginate((int) ($filters['per_page'] ?? 9))->withQueryString();
    }

    public function findPublishedBySlug(string $slug): ?Post
    {
        return $this->query()->published()->where('slug', $slug)->first();
    }
}
