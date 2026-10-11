<?php

namespace App\Interfaces;

use App\Models\Post;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface PostRepositoryInterface extends RepositoryInterface
{
    public function paginatePublished(array $filters): LengthAwarePaginator;

    public function findPublishedBySlug(string $slug): ?Post;
}
