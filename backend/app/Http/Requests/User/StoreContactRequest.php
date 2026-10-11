<?php

namespace App\Http\Requests\User;

use App\Http\Requests\ApiRequest;

class StoreContactRequest extends ApiRequest
{
    protected function prepareForValidation(): void
    {
        $this->normalizePhone('phone');
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255'],
            'phone' => ['nullable', 'regex:/^(0|\+84)\d{9}$/'],
            'message' => ['required', 'string', 'min:5', 'max:2000'],
            'order_code' => ['nullable', 'string', 'max:30'],
        ];
    }

    public function messages(): array
    {
        return ['phone.regex' => 'Số điện thoại không hợp lệ.'];
    }
}
