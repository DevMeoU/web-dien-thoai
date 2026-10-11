<?php

namespace App\Http\Controllers\API\User;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\User\StoreContactRequest;
use App\Http\Resources\ContactRequestResource;
use App\Http\Resources\ContentPageResource;
use App\Services\ContactRequestService;
use App\Services\ContentPageService;
use App\Services\SettingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

/** Nội dung công khai: cấu hình cửa hàng, trang chính sách/giới thiệu và gửi yêu cầu liên hệ. */
class ContentController extends Controller
{
    public function __construct(
        private readonly SettingService $settings,
        private readonly ContentPageService $pages,
        private readonly ContactRequestService $contacts,
    ) {}

    public function settings(): JsonResponse
    {
        return ApiResponse::success($this->settings->publicSettings());
    }

    public function pages(): AnonymousResourceCollection
    {
        return ContentPageResource::collection($this->pages->listPublic());
    }

    public function page(string $slug): ContentPageResource
    {
        return new ContentPageResource($this->pages->findPublic($slug));
    }

    public function contact(StoreContactRequest $request): JsonResponse
    {
        $contact = $this->contacts->submit($request->validated());

        return ApiResponse::success(new ContactRequestResource($contact), 'Chúng tôi đã nhận được yêu cầu và sẽ phản hồi sớm.', 201);
    }
}
