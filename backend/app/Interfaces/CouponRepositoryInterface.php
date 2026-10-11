<?php

namespace App\Interfaces;

use App\Models\Coupon;

interface CouponRepositoryInterface extends RepositoryInterface
{
    public function findByCode(string $code, bool $lock = false): ?Coupon;

    public function changeUsage(Coupon $coupon, int $delta): void;
}
