<?php

namespace App\Http\Controllers\API\User;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\User\NewsletterRequest;
use App\Services\NewsletterService;
use Illuminate\Http\JsonResponse;

class NewsletterController extends Controller
{
    public function __construct(private readonly NewsletterService $newsletter) {}

    public function subscribe(NewsletterRequest $request): JsonResponse
    {
        $this->newsletter->subscribe($request->validated('email'));

        return ApiResponse::success(null, 'Cảm ơn bạn đã đăng ký nhận tin.', 201);
    }
}
