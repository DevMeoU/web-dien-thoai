<?php

namespace App\Http\Requests\User;

use App\Http\Requests\ApiRequest;

class NewsletterRequest extends ApiRequest
{
    public function rules(): array
    {
        return ['email' => ['required', 'string', 'email:rfc', 'max:255']];
    }
}
