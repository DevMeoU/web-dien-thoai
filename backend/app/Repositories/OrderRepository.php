<?php

namespace App\Repositories;

use App\Interfaces\OrderRepositoryInterface;
use App\Models\Order;
use App\Models\OrderStatusHistory;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;

class OrderRepository extends BaseRepository implements OrderRepositoryInterface
{
    protected function model(): string
    {
        return Order::class;
    }

    public function paginateForUser(User $user, array $filters): LengthAwarePaginator
    {
        return $this->query()->with('items')->where('user_id', $user->id)
            ->when($filters['q'] ?? null, fn ($q, $term) => $q->where('code', 'like', "%{$term}%"))
            ->when($filters['status'] ?? null, fn ($q, $status) => $q->where('status', $status))
            ->latest('id')->paginate((int) ($filters['per_page'] ?? 10))->withQueryString();
    }

    public function findByCodeForUser(User $user, string $code): ?Order
    {
        return $this->query()->with(['items.review', 'histories'])
            ->where('user_id', $user->id)->where('code', $code)->first();
    }

    public function paginateAdmin(array $filters): LengthAwarePaginator
    {
        return $this->query()->with(['user:id,name,email,phone', 'items'])
            ->when($filters['q'] ?? null, fn (Builder $q, $term) => $q->where(fn ($sub) => $sub
                ->where('code', 'like', "%{$term}%")->orWhere('recipient_name', 'like', "%{$term}%")
                ->orWhere('recipient_phone', 'like', "%{$term}%")
                ->orWhereHas('user', fn ($u) => $u->where('name', 'like', "%{$term}%")->orWhere('email', 'like', "%{$term}%"))))
            ->when($filters['user_id'] ?? null, fn ($q, $id) => $q->where('user_id', $id))
            ->when($filters['status'] ?? null, fn ($q, $status) => $q->where('status', $status))
            ->when($filters['payment_status'] ?? null, fn ($q, $status) => $q->where('payment_status', $status))
            ->when($filters['from'] ?? null, fn ($q, $from) => $q->whereDate('created_at', '>=', $from))
            ->when($filters['to'] ?? null, fn ($q, $to) => $q->whereDate('created_at', '<=', $to))
            ->latest('id')->paginate((int) ($filters['per_page'] ?? 15))->withQueryString();
    }

    public function findDetail(int $id): ?Order
    {
        return $this->query()->with(['user:id,name,email,phone', 'items', 'histories.actor:id,name', 'coupon:id,code'])->find($id);
    }

    public function lockForUpdate(int $id): ?Order
    {
        return $this->query()->whereKey($id)->lockForUpdate()->first();
    }

    public function createItems(Order $order, array $items): void
    {
        $order->items()->createMany($items);
    }

    public function addHistory(Order $order, ?string $from, string $to, ?string $note, ?int $changedBy): OrderStatusHistory
    {
        return $order->histories()->create(['from_status' => $from, 'to_status' => $to, 'note' => $note, 'changed_by' => $changedBy]);
    }

    public function codeExists(string $code): bool
    {
        return $this->query()->where('code', $code)->exists();
    }
}
