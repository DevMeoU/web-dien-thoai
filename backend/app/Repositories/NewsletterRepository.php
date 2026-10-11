<?php

namespace App\Repositories;

use App\Interfaces\NewsletterRepositoryInterface;
use App\Models\NewsletterSubscriber;
use Illuminate\Database\Eloquent\Builder;

class NewsletterRepository extends BaseRepository implements NewsletterRepositoryInterface
{
    protected function model(): string
    {
        return NewsletterSubscriber::class;
    }

    protected function applyFilters(Builder $query, array $filters): void
    {
        $query
            ->when($filters['q'] ?? null, fn ($q, $term) => $q->where('email', 'like', "%{$term}%"))
            ->orderByDesc('id');
    }

    public function findByEmail(string $email): ?NewsletterSubscriber
    {
        return $this->query()->where('email', $email)->first();
    }
}
