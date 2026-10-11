<?php

namespace App\Http\Requests\Auth;

use App\Http\Requests\ApiRequest;

class LoginRequest extends ApiRequest
{
    public function rules(): array
    {
        return ['email' => ['required', 'string', 'max:255'], 'password' => ['required', 'string']];
    }
}
