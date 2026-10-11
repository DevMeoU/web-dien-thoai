<?php

namespace App\Http\Requests\User;

use App\Http\Requests\ApiRequest;

class ChangePasswordRequest extends ApiRequest
{
    public function rules(): array
    {
        return [
            'current_password' => ['required', 'string'],
            'password' => ['required', 'string', 'min:8', 'max:100', 'confirmed', 'different:current_password'],
        ];
    }

    public function messages(): array
    {
        return ['password.different' => 'Mật khẩu mới phải khác mật khẩu hiện tại.'];
    }
}
