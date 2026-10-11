<?php

namespace App\Http\Requests\Admin;

use App\Http\Requests\ApiRequest;
use App\Models\Product;
use Illuminate\Validation\Rule;

class ProductRequest extends ApiRequest
{
    public function rules(): array
    {
        $required = $this->requiredOnCreate();
        $id = $this->route('product');

        return [
            'name' => [$required, 'string', 'max:255'],
            'slug' => ['sometimes', 'nullable', 'string', 'max:255'],
            'code' => ['sometimes', 'nullable', 'string', 'max:50', Rule::unique('products', 'code')->ignore($id)],
            'description' => ['sometimes', 'nullable', 'string'],
            'category_id' => ['sometimes', 'nullable', 'integer', 'exists:categories,id'],
            'brand_id' => ['sometimes', 'nullable', 'integer', 'exists:brands,id'],
            'price' => [$required, 'numeric', 'min:0'],
            'compare_at_price' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'tagline' => ['sometimes', 'nullable', 'string', 'max:160'],
            'option_label' => ['sometimes', 'string', 'max:30'],
            'warranty' => ['sometimes', 'nullable', 'string', 'max:255'],
            'in_the_box' => ['sometimes', 'nullable', 'string'],
            // Tính năng nổi bật: danh sách câu ngắn. Thông số kỹ thuật: danh sách cặp nhãn - giá trị.
            'highlights' => ['sometimes', 'nullable', 'array', 'max:12'],
            'highlights.*' => ['string', 'max:200'],
            'specs' => ['sometimes', 'nullable', 'array', 'max:40'],
            'specs.*.label' => ['required', 'string', 'max:80'],
            'specs.*.value' => ['required', 'string', 'max:255'],
            'collections' => ['sometimes', 'nullable', 'array'],
            'collections.*' => ['string', 'max:50'],
            'status' => ['sometimes', Rule::in(Product::STATUSES)],
            'is_new' => ['sometimes', 'boolean'],
            'is_featured' => ['sometimes', 'boolean'],
            // Có thể tạo sẵn các phiên bản (dung lượng/cấu hình, màu) cùng lúc với sản phẩm.
            'variants' => ['sometimes', 'array', 'max:100'],
            'variants.*.sku' => ['required', 'string', 'max:60', 'distinct', 'unique:product_variants,sku'],
            'variants.*.configuration' => ['nullable', 'string', 'max:60'],
            'variants.*.color' => ['nullable', 'string', 'max:40'],
            'variants.*.color_hex' => ['nullable', 'string', 'max:9'],
            'variants.*.price' => ['nullable', 'numeric', 'min:0'],
            'variants.*.stock' => ['required', 'integer', 'min:0'],
            'variants.*.is_active' => ['sometimes', 'boolean'],
        ];
    }
}
