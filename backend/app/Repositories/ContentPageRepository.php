<?php

namespace App\Repositories;

use App\Interfaces\ContentPageRepositoryInterface;
use App\Models\ContentPage;
use Illuminate\Support\Collection;

class ContentPageRepository extends BaseRepository implements ContentPageRepositoryInterface
{
    protected function model(): string
    {
        return ContentPage::class;
    }

    public function findBySlug(string $slug): ?ContentPage
    {
        return $this->query()->where('slug', $slug)->first();
    }

    public function all(bool $onlyPublished): Collection
    {
        return $this->query()->when($onlyPublished, fn ($q) => $q->where('is_published', true))->orderBy('id')->get();
    }
}
