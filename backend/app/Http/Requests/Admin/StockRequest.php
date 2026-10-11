<?php

namespace App\Http\Requests\Admin;

use App\Http\Requests\ApiRequest;

class StockRequest extends ApiRequest
{
    public function rules(): array
    {
        // Tồn kho không được âm.
        return ['stock' => ['required', 'integer', 'min:0', 'max:1000000']];
    }
}
