<?php

namespace App\Http\Requests\Admin;

use App\Enums\OrderStatus;
use App\Http\Requests\ApiRequest;
use Illuminate\Validation\Rule;

class OrderStatusRequest extends ApiRequest
{
    public function rules(): array
    {
        return [
            'status' => ['required', Rule::in(OrderStatus::values())],
            'note' => ['nullable', 'string', 'max:500'],
        ];
    }
}
