<?php

namespace App\Helpers;

use Illuminate\Http\JsonResponse;

class ApiResponse
{
    public static function success(mixed $data = null, string $message = 'Thành công.', int $status = 200): JsonResponse
    {
        return response()->json(['message' => $message, 'data' => $data], $status);
    }

    public static function error(string $message, int $status): JsonResponse
    {
        return response()->json(['message' => $message, 'data' => null], $status);
    }
}
