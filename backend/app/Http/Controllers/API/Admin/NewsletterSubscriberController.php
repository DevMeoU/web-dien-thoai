<?php

namespace App\Http\Controllers\API\Admin;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\ListRequest;
use App\Http\Resources\NewsletterSubscriberResource;
use App\Services\NewsletterService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class NewsletterSubscriberController extends Controller
{
    public function __construct(private readonly NewsletterService $newsletter) {}

    public function index(ListRequest $request): AnonymousResourceCollection
    {
        return NewsletterSubscriberResource::collection($this->newsletter->list($request->validated()));
    }

    public function destroy(int $subscriber): JsonResponse
    {
        $this->newsletter->delete($subscriber);

        return ApiResponse::success(null, 'Đã xóa email khỏi danh sách nhận tin.');
    }
}
