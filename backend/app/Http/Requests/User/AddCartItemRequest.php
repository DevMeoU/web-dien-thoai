<?php

namespace App\Http\Requests\User;

use App\Http\Requests\ApiRequest;

class AddCartItemRequest extends ApiRequest
{
    public function rules(): array
    {
        return [
            'product_variant_id' => ['required', 'integer', 'exists:product_variants,id'],
            'quantity' => ['required', 'integer', 'min:1', 'max:99'],
        ];
    }
}
