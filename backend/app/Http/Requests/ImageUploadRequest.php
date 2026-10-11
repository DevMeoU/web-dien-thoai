<?php

namespace App\Http\Requests;

class ImageUploadRequest extends ApiRequest
{
    public function rules(): array
    {
        return ['image' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:4096']];
    }
}
