<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;

/** Tham số tìm kiếm, lọc và phân trang dùng chung cho các danh sách quản trị và danh sách của khách. */
class ListRequest extends ApiRequest
{
    public function rules(): array
    {
        $flag = ['sometimes', Rule::in(['true', 'false', '1', '0', true, false, 1, 0])];

        return [
            'q' => ['sometimes', 'nullable', 'string', 'max:100'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:100'],
            'page' => ['sometimes', 'integer', 'min:1'],
            'status' => ['sometimes', 'nullable', 'string', 'max:20'],
            'payment_status' => ['sometimes', 'nullable', Rule::in(['unpaid', 'paid'])],
            'is_active' => $flag,
            'is_visible' => $flag,
            'position' => ['sometimes', 'nullable', Rule::in(['hero', 'collection'])],
            'role' => ['sometimes', 'nullable', Rule::in(['user', 'admin'])],
            'parent_id' => ['sometimes', 'nullable', 'integer'],
            'product_id' => ['sometimes', 'nullable', 'integer'],
            'rating' => ['sometimes', 'nullable', 'integer', 'between:1,5'],
            'stock_status' => ['sometimes', 'nullable', Rule::in(['low', 'out'])],
            'from' => ['sometimes', 'nullable', 'date'],
            'to' => ['sometimes', 'nullable', 'date', 'after_or_equal:from'],
        ];
    }
}
