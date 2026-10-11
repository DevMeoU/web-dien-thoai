<?php

namespace App\Http\Requests\Admin;

use App\Http\Requests\ApiRequest;

class SettingRequest extends ApiRequest
{
    public function rules(): array
    {
        return [
            'store_name' => ['sometimes', 'required', 'string', 'max:255'],
            'contact_email' => ['sometimes', 'nullable', 'email', 'max:255'],
            'contact_phone' => ['sometimes', 'nullable', 'string', 'max:30'],
            'contact_address' => ['sometimes', 'nullable', 'string', 'max:500'],
            'about_content' => ['sometimes', 'nullable', 'string', 'max:20000'],
            'shipping_fee' => ['sometimes', 'numeric', 'min:0'],
            'free_shipping_threshold' => ['sometimes', 'numeric', 'min:0'],
            'low_stock_threshold' => ['sometimes', 'integer', 'min:0', 'max:1000'],
        ];
    }
}
