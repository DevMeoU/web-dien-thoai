<?php

namespace App\Http\Requests\Admin;

use App\Http\Requests\ApiRequest;

class OrderNoteRequest extends ApiRequest
{
    public function rules(): array
    {
        return ['admin_note' => ['present', 'nullable', 'string', 'max:2000']];
    }
}
