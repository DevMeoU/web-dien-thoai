<?php

namespace App\Http\Requests\Admin;

use App\Http\Requests\ApiRequest;

class ReviewVisibilityRequest extends ApiRequest
{
    public function rules(): array
    {
        return ['is_visible' => ['required', 'boolean']];
    }
}
