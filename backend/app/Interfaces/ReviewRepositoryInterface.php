<?php

namespace App\Interfaces;

use App\Models\OrderItem;
use App\Models\Review;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

interface ReviewRepositoryInterface extends RepositoryInterface
{
    /** Nhận xét tốt (từ 4 sao, có nội dung) đang công khai để giới thiệu ở trang chủ. */
    public function featured(int $limit): Collection;

    /** Đánh giá đang công khai của một sản phẩm, có thể lọc theo số sao. */
    public function paginateForProduct(int $productId, array $filters): LengthAwarePaginator;

    /** @return array{average: float, count: int, distribution: array<int, int>} chỉ tính đánh giá đang công khai. */
    public function summaryForProduct(int $productId): array;

    public function paginateAdmin(array $filters): LengthAwarePaginator;

    public function listForUser(User $user): Collection;

    public function findForUser(User $user, int $id): ?Review;

    public function findByOrderItem(int $orderItemId): ?Review;

    /** Dòng đơn hàng thuộc về khách (kèm đơn) hoặc null nếu không phải của khách. */
    public function findPurchasedItem(User $user, int $orderItemId): ?OrderItem;

    /** Sản phẩm trong đơn hoàn tất mà khách chưa đánh giá. */
    public function eligibleItems(User $user): Collection;
}
