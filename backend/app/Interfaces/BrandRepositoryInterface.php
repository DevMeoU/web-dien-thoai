<?php

namespace App\Interfaces;

use App\Models\Brand;
use Illuminate\Support\Collection;

interface BrandRepositoryInterface extends RepositoryInterface
{
    public function listActive(): Collection;

    public function productCount(Brand $brand): int;
}
