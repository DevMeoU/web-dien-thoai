<?php

namespace App\Exceptions;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use RuntimeException;

/** Lỗi nghiệp vụ có mã HTTP riêng; được hiển thị thành JSON thống nhất. */
class ApiException extends RuntimeException
{
    public function __construct(string $message, protected int $status = 400, protected array $errors = [])
    {
        parent::__construct($message);
    }

    public function render(Request $request): JsonResponse
    {
        $body = ['message' => $this->getMessage(), 'data' => null];
        if ($this->errors !== []) {
            $body['errors'] = $this->errors;
        }

        return response()->json($body, $this->status);
    }
}
