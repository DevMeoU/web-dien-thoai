<?php

namespace App\Http\Requests\Auth;

use App\Http\Requests\ApiRequest;

class RegisterRequest extends ApiRequest
{
    protected function prepareForValidation(): void
    {
        $this->normalizePhone('phone');
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'max:100', 'confirmed'],
            'phone' => ['nullable', 'regex:/^(0|\+84)\d{9}$/'],
        ];
    }

    public function messages(): array
    {
        return ['email.unique' => 'Email này đã được đăng ký.', 'phone.regex' => 'Số điện thoại không hợp lệ.'];
    }
}
