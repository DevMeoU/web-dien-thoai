<?php

namespace App\Http\Requests\Admin;

use App\Http\Requests\ApiRequest;
use App\Models\Banner;
use Illuminate\Validation\Rule;

class BannerRequest extends ApiRequest
{
    public function rules(): array
    {
        return [
            'title' => [$this->requiredOnCreate(), 'string', 'max:255'],
            'subtitle' => ['sometimes', 'nullable', 'string', 'max:255'],
            'link' => ['sometimes', 'nullable', 'string', 'max:255'],
            'position' => ['sometimes', Rule::in(Banner::POSITIONS)],
            'sort_order' => ['sometimes', 'integer', 'min:0'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
