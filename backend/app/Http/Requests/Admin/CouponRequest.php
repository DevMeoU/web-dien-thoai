<?php

namespace App\Http\Requests\Admin;

use App\Http\Requests\ApiRequest;
use App\Models\Coupon;
use Illuminate\Validation\Rule;

class CouponRequest extends ApiRequest
{
    protected function prepareForValidation(): void
    {
        if (is_string($this->input('code'))) {
            $this->merge(['code' => strtoupper(trim($this->input('code')))]);
        }
    }

    public function rules(): array
    {
        $required = $this->requiredOnCreate();
        $type = $this->input('type', $this->route('coupon') ? Coupon::query()->whereKey($this->route('coupon'))->value('type') : null);

        return [
            'code' => [$required, 'string', 'max:40', 'alpha_dash', Rule::unique('coupons', 'code')->ignore($this->route('coupon'))],
            'description' => ['sometimes', 'nullable', 'string', 'max:255'],
            'type' => [$required, Rule::in([Coupon::TYPE_PERCENT, Coupon::TYPE_FIXED])],
            // Giảm theo phần trăm không vượt quá 100.
            'value' => [$required, 'numeric', 'gt:0', $type === Coupon::TYPE_PERCENT ? 'max:100' : 'max:100000000'],
            'min_order_amount' => ['sometimes', 'numeric', 'min:0'],
            'max_discount' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'usage_limit' => ['sometimes', 'nullable', 'integer', 'min:1'],
            'starts_at' => ['sometimes', 'nullable', 'date'],
            'expires_at' => ['sometimes', 'nullable', 'date', 'after_or_equal:starts_at'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
