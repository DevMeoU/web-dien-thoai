<?php

namespace App\Http\Requests\User;

use App\Http\Requests\ApiRequest;

class StoreReviewRequest extends ApiRequest
{
    public function rules(): array
    {
        $create = $this->isMethod('POST');

        return [
            'order_item_id' => [$create ? 'required' : 'prohibited', 'integer', 'exists:order_items,id'],
            'rating' => [$create ? 'required' : 'sometimes', 'integer', 'between:1,5'],
            'comment' => ['sometimes', 'nullable', 'string', 'max:2000'],
        ];
    }
}
