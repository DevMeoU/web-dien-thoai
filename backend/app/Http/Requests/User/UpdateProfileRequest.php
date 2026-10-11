<?php

namespace App\Http\Requests\User;

use App\Http\Requests\ApiRequest;

class UpdateProfileRequest extends ApiRequest
{
    protected function prepareForValidation(): void
    {
        $this->normalizePhone('phone');
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'phone' => ['sometimes', 'nullable', 'regex:/^(0|\+84)\d{9}$/'],
        ];
    }

    public function messages(): array
    {
        return ['phone.regex' => 'Số điện thoại không hợp lệ.'];
    }
}
