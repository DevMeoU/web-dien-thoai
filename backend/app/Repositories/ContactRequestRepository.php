<?php

namespace App\Repositories;

use App\Interfaces\ContactRequestRepositoryInterface;
use App\Models\ContactRequest;
use Illuminate\Database\Eloquent\Builder;

class ContactRequestRepository extends BaseRepository implements ContactRequestRepositoryInterface
{
    protected function model(): string
    {
        return ContactRequest::class;
    }

    protected function applyFilters(Builder $query, array $filters): void
    {
        $query
            ->when($filters['q'] ?? null, fn ($q, $term) => $q->where(fn ($sub) => $sub
                ->where('name', 'like', "%{$term}%")->orWhere('email', 'like', "%{$term}%")
                ->orWhere('phone', 'like', "%{$term}%")->orWhere('order_code', 'like', "%{$term}%")))
            ->when($filters['status'] ?? null, fn ($q, $status) => $q->where('status', $status))
            ->latest('id');
    }
}
