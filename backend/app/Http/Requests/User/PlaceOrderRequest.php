<?php

namespace App\Http\Requests\User;

use App\Http\Requests\ApiRequest;
use Illuminate\Validation\Rule;

class PlaceOrderRequest extends ApiRequest
{
    protected function prepareForValidation(): void
    {
        $this->normalizePhone('phone');
        $address = $this->input('address');
        if (is_array($address) && is_string($address['phone'] ?? null)) {
            $address['phone'] = preg_replace('/\s+/', '', $address['phone']);
            $this->merge(['address' => $address]);
        }
    }

    public function rules(): array
    {
        $phone = ['regex:/^(0|\+84)\d{9}$/'];

        return [
            // Chọn địa chỉ đã lưu hoặc nhập địa chỉ mới.
            'address_id' => ['nullable', 'integer', 'exists:addresses,id'],
            'address' => ['required_without:address_id', 'nullable', 'array'],
            'address.recipient_name' => ['required_with:address', 'string', 'max:255'],
            'address.phone' => ['required_with:address', ...$phone],
            'address.city' => ['required_with:address', 'string', 'max:255'],
            'address.district' => ['required_with:address', 'string', 'max:255'],
            'address.ward' => ['required_with:address', 'string', 'max:255'],
            'address.line' => ['required_with:address', 'string', 'max:255'],
            'save_address' => ['sometimes', 'boolean'],
            'email' => ['nullable', 'email', 'max:255'],
            'note' => ['nullable', 'string', 'max:500'],
            'coupon_code' => ['nullable', 'string', 'max:40'],
            'payment_method' => ['sometimes', Rule::in(['cod'])],
        ];
    }

    public function messages(): array
    {
        return ['address.phone.regex' => 'Số điện thoại người nhận không hợp lệ.'];
    }
}
