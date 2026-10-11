<?php

namespace App\Http\Requests\User;

use App\Http\Requests\ApiRequest;

class UpdateCartItemRequest extends ApiRequest
{
    public function rules(): array
    {
        return ['quantity' => ['required', 'integer', 'min:1', 'max:99']];
    }
}
