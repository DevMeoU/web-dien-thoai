<?php

namespace App\Http\Requests\Admin;

use App\Http\Requests\ApiRequest;
use App\Models\User;
use Illuminate\Validation\Rule;

class UserRoleRequest extends ApiRequest
{
    public function rules(): array
    {
        return ['role' => ['required', Rule::in([User::ROLE_USER, User::ROLE_ADMIN])]];
    }
}
