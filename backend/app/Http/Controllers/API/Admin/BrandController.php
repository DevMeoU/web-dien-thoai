<?php

namespace App\Http\Controllers\API\Admin;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\BrandRequest;
use App\Http\Requests\ImageUploadRequest;
use App\Http\Requests\ListRequest;
use App\Http\Resources\BrandResource;
use App\Services\BrandService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class BrandController extends Controller
{
    public function __construct(private readonly BrandService $brands) {}

    public function index(ListRequest $request): AnonymousResourceCollection
    {
        return BrandResource::collection($this->brands->list($request->validated()));
    }

    public function show(int $brand): BrandResource
    {
        return new BrandResource($this->brands->find($brand));
    }

    public function store(BrandRequest $request): JsonResponse
    {
        return ApiResponse::success(new BrandResource($this->brands->create($request->validated())), 'Đã tạo thương hiệu.', 201);
    }

    public function update(BrandRequest $request, int $brand): BrandResource
    {
        return new BrandResource($this->brands->update($brand, $request->validated()));
    }

    public function destroy(int $brand): JsonResponse
    {
        $this->brands->delete($brand);

        return ApiResponse::success(null, 'Đã xóa thương hiệu.');
    }

    public function uploadImage(ImageUploadRequest $request, int $brand): BrandResource
    {
        return new BrandResource($this->brands->uploadImage($brand, $request->file('image')));
    }
}
