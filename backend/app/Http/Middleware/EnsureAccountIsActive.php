<?php

namespace App\Http\Middleware;

use App\Helpers\ApiResponse;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/** Chặn tài khoản đã bị khóa dù token vẫn còn hiệu lực. */
class EnsureAccountIsActive
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        if ($user && ! $user->is_active) {
            $user->tokens()->delete();

            return ApiResponse::error('Tài khoản của bạn đã bị khóa. Vui lòng liên hệ cửa hàng.', 403);
        }

        return $next($request);
    }
}
