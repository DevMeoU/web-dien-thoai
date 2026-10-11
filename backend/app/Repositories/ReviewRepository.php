<?php

namespace App\Repositories;

use App\Enums\OrderStatus;
use App\Interfaces\ReviewRepositoryInterface;
use App\Models\OrderItem;
use App\Models\Review;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class ReviewRepository extends BaseRepository implements ReviewRepositoryInterface
{
    protected function model(): string
    {
        return Review::class;
    }

    public function featured(int $limit): Collection
    {
        return $this->query()->with(['user:id,name,avatar', 'product:id,name,slug'])
            ->where('is_visible', true)->where('rating', '>=', 4)->whereNotNull('comment')->where('comment', '!=', '')
            ->orderByDesc('rating')->latest('id')->limit($limit)->get();
    }

    public function paginateForProduct(int $productId, array $filters): LengthAwarePaginator
    {
        return $this->query()->with('user:id,name,avatar')
            ->where('product_id', $productId)->where('is_visible', true)
            ->when($filters['rating'] ?? null, fn ($q, $rating) => $q->where('rating', $rating))
            ->latest('id')->paginate((int) ($filters['per_page'] ?? 10))->withQueryString();
    }

    public function summaryForProduct(int $productId): array
    {
        $counts = $this->query()->where('product_id', $productId)->where('is_visible', true)
            ->selectRaw('rating, COUNT(*) as total')->groupBy('rating')->pluck('total', 'rating');

        $distribution = [];
        $count = 0;
        $sum = 0;
        foreach ([5, 4, 3, 2, 1] as $star) {
            $distribution[$star] = (int) ($counts[$star] ?? 0);
            $count += $distribution[$star];
            $sum += $star * $distribution[$star];
        }

        return ['average' => $count ? round($sum / $count, 2) : 0.0, 'count' => $count, 'distribution' => $distribution];
    }

    public function paginateAdmin(array $filters): LengthAwarePaginator
    {
        return $this->query()->with(['user:id,name,email', 'product:id,name,slug'])
            ->when($filters['q'] ?? null, fn ($q, $term) => $q->where(fn ($sub) => $sub
                ->where('comment', 'like', "%{$term}%")
                ->orWhereHas('user', fn ($u) => $u->where('name', 'like', "%{$term}%")->orWhere('email', 'like', "%{$term}%"))
                ->orWhereHas('product', fn ($p) => $p->where('name', 'like', "%{$term}%"))))
            ->when($filters['product_id'] ?? null, fn ($q, $id) => $q->where('product_id', $id))
            ->when($filters['rating'] ?? null, fn ($q, $rating) => $q->where('rating', $rating))
            ->when(isset($filters['is_visible']), fn ($q) => $q->where('is_visible', filter_var($filters['is_visible'], FILTER_VALIDATE_BOOLEAN)))
            ->when($filters['from'] ?? null, fn ($q, $from) => $q->whereDate('created_at', '>=', $from))
            ->when($filters['to'] ?? null, fn ($q, $to) => $q->whereDate('created_at', '<=', $to))
            ->latest('id')->paginate((int) ($filters['per_page'] ?? 15))->withQueryString();
    }

    public function listForUser(User $user): Collection
    {
        return $this->query()->with('product:id,name,slug,thumbnail')->where('user_id', $user->id)->latest('id')->get();
    }

    public function findForUser(User $user, int $id): ?Review
    {
        return $this->query()->where('user_id', $user->id)->find($id);
    }

    public function findByOrderItem(int $orderItemId): ?Review
    {
        return $this->query()->where('order_item_id', $orderItemId)->first();
    }

    public function findPurchasedItem(User $user, int $orderItemId): ?OrderItem
    {
        return OrderItem::query()->with('order')->whereKey($orderItemId)
            ->whereHas('order', fn ($q) => $q->where('user_id', $user->id))->first();
    }

    public function eligibleItems(User $user): Collection
    {
        return OrderItem::query()->with('order:id,code,completed_at')
            ->whereHas('order', fn ($q) => $q->where('user_id', $user->id)->where('status', OrderStatus::Completed->value))
            ->whereDoesntHave('review')->latest('id')->get();
    }
}
