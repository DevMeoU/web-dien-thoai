<?php

namespace App\Http\Requests\Admin;

use App\Http\Requests\ApiRequest;
use Illuminate\Validation\Rule;

class PostRequest extends ApiRequest
{
    public function rules(): array
    {
        $id = $this->route('post');

        return [
            'title' => [$this->requiredOnCreate(), 'string', 'max:255'],
            'slug' => ['sometimes', 'nullable', 'string', 'max:255', Rule::unique('posts', 'slug')->ignore($id)],
            'excerpt' => ['sometimes', 'nullable', 'string', 'max:500'],
            'content' => ['sometimes', 'nullable', 'string', 'max:100000'],
            'is_published' => ['sometimes', 'boolean'],
            'published_at' => ['sometimes', 'nullable', 'date'],
        ];
    }
}
