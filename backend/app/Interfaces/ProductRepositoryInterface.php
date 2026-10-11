<?php

namespace App\Interfaces;

use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

interface ProductRepositoryInterface extends RepositoryInterface
{
    /** Danh sách cho khách: chỉ sản phẩm đang bán, hỗ trợ lọc và sắp xếp. */
    public function paginatePublic(array $filters): LengthAwarePaginator;

    /** Danh sách cho quản trị: gồm cả sản phẩm ẩn và ngừng bán. */
    public function paginateAdmin(array $filters): LengthAwarePaginator;

    /** Tìm sản phẩm đang bán theo id số hoặc slug. */
    public function findActiveByKey(string $key): ?Product;

    public function loadDetail(Product $product): Product;

    public function related(Product $product, int $limit): Collection;

    public function hasOrders(Product $product): bool;

    public function addImage(Product $product, string $url): ProductImage;

    public function findImage(Product $product, int $imageId): ?ProductImage;

    public function deleteImage(ProductImage $image): void;

    public function updateRating(Product $product, float $average, int $count): void;
}
