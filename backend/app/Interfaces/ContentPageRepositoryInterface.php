<?php

namespace App\Interfaces;

use App\Models\ContentPage;
use Illuminate\Support\Collection;

interface ContentPageRepositoryInterface extends RepositoryInterface
{
    public function findBySlug(string $slug): ?ContentPage;

    public function all(bool $onlyPublished): Collection;
}
