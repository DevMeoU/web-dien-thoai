<?php

namespace App\Http\Requests\User;

use App\Http\Requests\ApiRequest;

/** Dùng cho kiểm tra mã giảm giá và tính trước tổng tiền thanh toán. */
class CouponCodeRequest extends ApiRequest
{
    public function rules(): array
    {
        return [
            'code' => ['sometimes', 'nullable', 'string', 'max:40'],
            'coupon_code' => ['sometimes', 'nullable', 'string', 'max:40'],
            'subtotal' => ['sometimes', 'numeric', 'min:0'],
        ];
    }
}
