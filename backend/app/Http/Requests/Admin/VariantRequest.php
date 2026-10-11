<?php

namespace App\Http\Requests\Admin;

use App\Http\Requests\ApiRequest;
use Illuminate\Validation\Rule;

class VariantRequest extends ApiRequest
{
    public function rules(): array
    {
        $required = $this->requiredOnCreate();

        return [
            'sku' => [$required, 'string', 'max:60', Rule::unique('product_variants', 'sku')->ignore($this->route('variant'))],
            'configuration' => ['sometimes', 'nullable', 'string', 'max:60'],
            'color' => ['sometimes', 'nullable', 'string', 'max:40'],
            'color_hex' => ['sometimes', 'nullable', 'string', 'max:9'],
            'price' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'stock' => [$required, 'integer', 'min:0'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
