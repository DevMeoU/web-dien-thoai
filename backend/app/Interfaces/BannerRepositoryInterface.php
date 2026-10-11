<?php

namespace App\Interfaces;

use Illuminate\Support\Collection;

interface BannerRepositoryInterface extends RepositoryInterface
{
    public function listActive(?string $position = null): Collection;
}
