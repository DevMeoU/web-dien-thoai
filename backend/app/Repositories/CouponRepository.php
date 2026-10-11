<?php

namespace App\Repositories;

use App\Interfaces\CouponRepositoryInterface;
use App\Models\Coupon;
use Illuminate\Database\Eloquent\Builder;

class CouponRepository extends BaseRepository implements CouponRepositoryInterface
{
    protected function model(): string
    {
        return Coupon::class;
    }

    protected function applyFilters(Builder $query, array $filters): void
    {
        $query
            ->when($filters['q'] ?? null, fn ($q, $term) => $q->where(fn ($sub) => $sub->where('code', 'like', "%{$term}%")->orWhere('description', 'like', "%{$term}%")))
            ->when(isset($filters['is_active']), fn ($q) => $q->where('is_active', filter_var($filters['is_active'], FILTER_VALIDATE_BOOLEAN)))
            ->latest('id');
    }

    public function findByCode(string $code, bool $lock = false): ?Coupon
    {
        return $this->query()->where('code', strtoupper(trim($code)))->when($lock, fn ($q) => $q->lockForUpdate())->first();
    }

    public function changeUsage(Coupon $coupon, int $delta): void
    {
        $delta >= 0 ? $coupon->increment('used_count', $delta) : $coupon->decrement('used_count', abs($delta));
    }
}
