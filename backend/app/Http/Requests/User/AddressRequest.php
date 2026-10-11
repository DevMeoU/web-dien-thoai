<?php

namespace App\Http\Requests\User;

use App\Http\Requests\ApiRequest;

class AddressRequest extends ApiRequest
{
    protected function prepareForValidation(): void
    {
        $this->normalizePhone('phone');
    }

    public function rules(): array
    {
        $required = $this->requiredOnCreate();

        return [
            'recipient_name' => [$required, 'string', 'max:255'],
            'phone' => [$required, 'regex:/^(0|\+84)\d{9}$/'],
            'city' => [$required, 'string', 'max:255'],
            'district' => [$required, 'string', 'max:255'],
            'ward' => [$required, 'string', 'max:255'],
            'line' => [$required, 'string', 'max:255'],
            'is_default' => ['sometimes', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return ['phone.regex' => 'Số điện thoại không hợp lệ.'];
    }
}
