<?php

namespace App\Http\Requests\Admin;

use App\Http\Requests\ApiRequest;

class ContentPageRequest extends ApiRequest
{
    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'content' => ['sometimes', 'nullable', 'string', 'max:100000'],
            'is_published' => ['sometimes', 'boolean'],
        ];
    }
}
