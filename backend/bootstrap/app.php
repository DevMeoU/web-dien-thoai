<?php

use App\Helpers\ApiResponse;
use App\Http\Middleware\EnsureAccountIsActive;
use App\Http\Middleware\EnsureUserIsAdmin;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Routing\Exceptions\ThrottleRequestsException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // API dùng Bearer token của Sanctum nên không bật cơ chế cookie/CSRF của SPA.
        $middleware->alias(['admin' => EnsureUserIsAdmin::class, 'active' => EnsureAccountIsActive::class]);
        $middleware->redirectGuestsTo(fn (Request $request) => $request->is('api/*') ? null : '/');
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $isApi = fn (Request $request) => $request->is('api/*') || $request->expectsJson();

        $exceptions->shouldRenderJsonWhen(fn (Request $request, Throwable $exception) => $isApi($request));

        // Thông báo lỗi chung được Việt hóa và có cùng cấu trúc {message, data}.
        $exceptions->render(fn (AuthenticationException $e, Request $request) => $isApi($request)
            ? ApiResponse::error('Bạn cần đăng nhập để thực hiện thao tác này.', 401) : null);
        $exceptions->render(fn (ModelNotFoundException|NotFoundHttpException $e, Request $request) => $isApi($request)
            ? ApiResponse::error('Không tìm thấy tài nguyên yêu cầu.', 404) : null);
        $exceptions->render(fn (ThrottleRequestsException $e, Request $request) => $isApi($request)
            ? ApiResponse::error('Bạn thao tác quá nhanh. Vui lòng thử lại sau ít phút.', 429) : null);
        // Vi phạm khóa duy nhất hoặc khóa ngoại (ví dụ xóa dữ liệu đang được tham chiếu).
        $exceptions->render(fn (QueryException $e, Request $request) => $isApi($request) && (string) $e->getCode() === '23000'
            ? ApiResponse::error('Dữ liệu bị trùng hoặc đang được sử dụng ở nơi khác.', 409) : null);
    })->create();
