<?php

namespace App\Services;

use App\Exceptions\BusinessRuleException;
use App\Interfaces\CouponRepositoryInterface;
use App\Models\Coupon;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

class CouponService extends CrudService
{
    public function __construct(private readonly CouponRepositoryInterface $coupons)
    {
        parent::__construct($coupons);
    }

    /** Hạn dùng nhập theo ngày (không kèm giờ) được hiểu là hết ngày đó. */
    protected function prepare(array $data, ?Model $current = null): array
    {
        if (! empty($data['expires_at']) && strlen((string) $data['expires_at']) <= 10) {
            $data['expires_at'] = Carbon::parse($data['expires_at'])->endOfDay();
        }

        return $data;
    }

    protected function guardDelete(Model $model): void
    {
        if ($model->used_count > 0) {
            throw new BusinessRuleException('Mã giảm giá đã được sử dụng nên không thể xóa. Hãy tắt mã thay vì xóa.', 409);
        }
    }

    /** Kiểm tra mã và tính số tiền giảm, không thay đổi dữ liệu. */
    public function quote(string $code, float $subtotal): array
    {
        $coupon = $this->coupons->findByCode($code) ?? throw new BusinessRuleException('Mã giảm giá không hợp lệ.');

        return [$coupon, $this->discountFor($coupon, $subtotal)];
    }

    /** Dùng mã khi đặt hàng: khóa dòng mã, kiểm tra lại điều kiện rồi tăng lượt dùng. Gọi trong transaction. */
    public function redeem(string $code, float $subtotal): array
    {
        $coupon = $this->coupons->findByCode($code, lock: true) ?? throw new BusinessRuleException('Mã giảm giá không hợp lệ.');
        $discount = $this->discountFor($coupon, $subtotal);
        $this->coupons->changeUsage($coupon, 1);

        return [$coupon, $discount];
    }

    /** Hoàn lại một lượt dùng khi đơn hàng bị hủy. */
    public function release(int $couponId): void
    {
        $coupon = $this->coupons->find($couponId);
        if ($coupon && $coupon->used_count > 0) {
            $this->coupons->changeUsage($coupon, -1);
        }
    }

    private function discountFor(Coupon $coupon, float $subtotal): float
    {
        $now = now();
        if (! $coupon->is_active) {
            throw new BusinessRuleException('Mã giảm giá hiện không hoạt động.');
        }
        if ($coupon->starts_at && $coupon->starts_at->gt($now)) {
            throw new BusinessRuleException('Mã giảm giá chưa đến thời gian sử dụng.');
        }
        if ($coupon->expires_at && $coupon->expires_at->lt($now)) {
            throw new BusinessRuleException('Mã giảm giá đã hết hạn.');
        }
        if ($coupon->usage_limit !== null && $coupon->used_count >= $coupon->usage_limit) {
            throw new BusinessRuleException('Mã giảm giá đã hết lượt sử dụng.');
        }
        if ($subtotal < (float) $coupon->min_order_amount) {
            throw new BusinessRuleException('Đơn hàng chưa đạt giá trị tối thiểu '.number_format((float) $coupon->min_order_amount, 0, ',', '.').' ₫ để dùng mã này.');
        }

        $discount = $coupon->type === Coupon::TYPE_PERCENT
            ? $subtotal * (float) $coupon->value / 100
            : (float) $coupon->value;
        if ($coupon->max_discount !== null) {
            $discount = min($discount, (float) $coupon->max_discount);
        }

        return round(min($discount, $subtotal), 2);
    }
}
