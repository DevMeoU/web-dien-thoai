<?php

namespace App\Http\Requests\Admin;

use App\Http\Requests\ApiRequest;
use App\Models\Product;
use Illuminate\Validation\Rule;

class ProductStatusRequest extends ApiRequest
{
    public function rules(): array
    {
        return ['status' => ['required', Rule::in(Product::STATUSES)]];
    }
}
