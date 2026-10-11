<?php

namespace App\Interfaces;

use App\Models\ProductVariant;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

interface ProductVariantRepositoryInterface extends RepositoryInterface
{
    /** Khóa các dòng tồn kho trong transaction để tránh bán vượt số lượng. */
    public function lockForUpdate(array $ids): Collection;

    public function paginateInventory(array $filters, int $threshold): LengthAwarePaginator;

    public function lowStock(int $threshold, int $limit): Collection;

    public function hasOrders(ProductVariant $variant): bool;

    public function adjustStock(ProductVariant $variant, int $delta): void;
}
