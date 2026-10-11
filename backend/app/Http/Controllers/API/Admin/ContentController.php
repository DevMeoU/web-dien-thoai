<?php

namespace App\Http\Controllers\API\Admin;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ContentPageRequest;
use App\Http\Requests\Admin\SettingRequest;
use App\Http\Resources\ContentPageResource;
use App\Services\ContentPageService;
use App\Services\SettingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

/** Cấu hình cửa hàng (liên hệ, giới thiệu, phí giao hàng) và các trang nội dung tĩnh. */
class ContentController extends Controller
{
    public function __construct(
        private readonly SettingService $settings,
        private readonly ContentPageService $pages,
    ) {}

    public function settings(): JsonResponse
    {
        return ApiResponse::success($this->settings->all());
    }

    public function updateSettings(SettingRequest $request): JsonResponse
    {
        return ApiResponse::success($this->settings->update($request->validated()), 'Đã lưu cấu hình.');
    }

    public function pages(): AnonymousResourceCollection
    {
        return ContentPageResource::collection($this->pages->listAdmin());
    }

    public function page(string $slug): ContentPageResource
    {
        return new ContentPageResource($this->pages->findAdmin($slug));
    }

    public function updatePage(ContentPageRequest $request, string $slug): ContentPageResource
    {
        return new ContentPageResource($this->pages->update($slug, $request->validated()));
    }
}
