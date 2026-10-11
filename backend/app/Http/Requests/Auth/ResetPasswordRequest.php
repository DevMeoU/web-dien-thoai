<?php

namespace App\Http\Requests\Auth;

use App\Http\Requests\ApiRequest;

class ResetPasswordRequest extends ApiRequest
{
    public function rules(): array
    {
        return [
            'token' => ['required', 'string'],
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string', 'min:8', 'max:100', 'confirmed'],
        ];
    }
}
