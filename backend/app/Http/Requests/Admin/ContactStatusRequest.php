<?php

namespace App\Http\Requests\Admin;

use App\Http\Requests\ApiRequest;
use App\Models\ContactRequest;
use Illuminate\Validation\Rule;

class ContactStatusRequest extends ApiRequest
{
    public function rules(): array
    {
        return [
            'status' => ['sometimes', 'required', Rule::in(ContactRequest::STATUSES)],
            'admin_note' => ['sometimes', 'nullable', 'string', 'max:2000'],
        ];
    }
}
