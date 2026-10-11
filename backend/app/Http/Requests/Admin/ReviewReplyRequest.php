<?php

namespace App\Http\Requests\Admin;

use App\Http\Requests\ApiRequest;

class ReviewReplyRequest extends ApiRequest
{
    public function rules(): array
    {
        return ['reply' => ['required', 'string', 'min:2', 'max:2000']];
    }
}
