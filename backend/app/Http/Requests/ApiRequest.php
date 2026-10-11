<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/** Request cơ sở: việc phân quyền đã do middleware auth/admin đảm nhiệm nên luôn cho phép ở đây. */
abstract class ApiRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** Quy tắc "bắt buộc khi tạo, tùy chọn khi cập nhật". */
    protected function requiredOnCreate(): string
    {
        return $this->isMethod('POST') ? 'required' : 'sometimes';
    }

    /** Bỏ khoảng trắng trong số điện thoại trước khi kiểm tra định dạng. */
    protected function normalizePhone(string $key): void
    {
        $value = $this->input($key);
        if (is_string($value)) {
            $this->merge([$key => preg_replace('/\s+/', '', $value)]);
        }
    }
}
