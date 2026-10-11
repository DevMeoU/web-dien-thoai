<?php

namespace App\Http\Controllers\API\Admin;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\BannerRequest;
use App\Http\Requests\ImageUploadRequest;
use App\Http\Requests\ListRequest;
use App\Http\Resources\BannerResource;
use App\Services\BannerService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class BannerController extends Controller
{
    public function __construct(private readonly BannerService $banners) {}

    public function index(ListRequest $request): AnonymousResourceCollection
    {
        return BannerResource::collection($this->banners->list($request->validated()));
    }

    public function show(int $banner): BannerResource
    {
        return new BannerResource($this->banners->find($banner));
    }

    public function store(BannerRequest $request): JsonResponse
    {
        return ApiResponse::success(new BannerResource($this->banners->create($request->validated())), 'Đã tạo banner.', 201);
    }

    public function update(BannerRequest $request, int $banner): BannerResource
    {
        return new BannerResource($this->banners->update($banner, $request->validated()));
    }

    public function destroy(int $banner): JsonResponse
    {
        $this->banners->delete($banner);

        return ApiResponse::success(null, 'Đã xóa banner.');
    }

    public function uploadImage(ImageUploadRequest $request, int $banner): BannerResource
    {
        return new BannerResource($this->banners->uploadImage($banner, $request->file('image')));
    }
}
