<?php

namespace App\Http\Requests\User;

use App\Http\Requests\ApiRequest;

class WishlistRequest extends ApiRequest
{
    public function rules(): array
    {
        return ['product_id' => ['required', 'integer', 'exists:products,id']];
    }
}
