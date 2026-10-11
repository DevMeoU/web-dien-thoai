<?php

namespace App\Http\Requests\Admin;

use App\Http\Requests\ApiRequest;

class UserStatusRequest extends ApiRequest
{
    public function rules(): array
    {
        return ['is_active' => ['required', 'boolean']];
    }
}
