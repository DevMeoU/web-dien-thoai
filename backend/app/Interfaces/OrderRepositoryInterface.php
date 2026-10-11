<?php

namespace App\Interfaces;

use App\Models\Order;
use App\Models\OrderStatusHistory;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface OrderRepositoryInterface extends RepositoryInterface
{
    public function paginateForUser(User $user, array $filters): LengthAwarePaginator;

    public function findByCodeForUser(User $user, string $code): ?Order;

    public function paginateAdmin(array $filters): LengthAwarePaginator;

    /** Đơn kèm sản phẩm, lịch sử trạng thái và khách hàng. */
    public function findDetail(int $id): ?Order;

    /** Khóa đơn trong transaction khi đổi trạng thái để tránh hai thao tác đồng thời. */
    public function lockForUpdate(int $id): ?Order;

    public function createItems(Order $order, array $items): void;

    public function addHistory(Order $order, ?string $from, string $to, ?string $note, ?int $changedBy): OrderStatusHistory;

    public function codeExists(string $code): bool;
}
