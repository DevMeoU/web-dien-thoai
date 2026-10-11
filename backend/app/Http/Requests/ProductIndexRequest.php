<?php

namespace App\Http\Requests;

use App\Models\Product;
use Illuminate\Validation\Rule;

class ProductIndexRequest extends ApiRequest
{
    public function rules(): array
    {
        $flag = ['sometimes', Rule::in(['true', 'false', '1', '0', true, false, 1, 0])];

        return [
            'search' => ['sometimes', 'nullable', 'string', 'max:100'],
            'q' => ['sometimes', 'nullable', 'string', 'max:100'],
            'category' => ['sometimes', 'nullable', 'string', 'max:100'],
            'brand' => ['sometimes', 'nullable', 'string', 'max:100'],
            'collection' => ['sometimes', 'nullable', 'string', 'max:50'],
            'status' => ['sometimes', 'nullable', Rule::in(Product::STATUSES)],
            'min_price' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'max_price' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'configuration' => ['sometimes', 'nullable', 'string', 'max:60'],
            'color' => ['sometimes', 'nullable', 'string', 'max:40'],
            'in_stock' => $flag,
            'is_new' => $flag,
            'is_featured' => $flag,
            'on_sale' => $flag,
            'sort' => ['sometimes', Rule::in(['newest', 'price_asc', 'price_desc', 'price-asc', 'price-desc', 'name', 'rating', 'best_selling', 'best-selling'])],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:100'],
            'page' => ['sometimes', 'integer', 'min:1'],
        ];
    }
}
