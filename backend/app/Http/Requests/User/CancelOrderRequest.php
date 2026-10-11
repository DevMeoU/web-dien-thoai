<?php

namespace App\Http\Requests\User;

use App\Http\Requests\ApiRequest;

class CancelOrderRequest extends ApiRequest
{
    public function rules(): array
    {
        return ['reason' => ['required', 'string', 'min:3', 'max:500']];
    }

    public function messages(): array
    {
        return ['reason.required' => 'Vui lòng nhập lý do hủy đơn.'];
    }
}
