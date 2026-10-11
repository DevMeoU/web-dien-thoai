<?php

namespace App\Http\Controllers\API\Admin;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ProductRequest;
use App\Http\Requests\Admin\ProductStatusRequest;
use App\Http\Requests\ImageUploadRequest;
use App\Http\Requests\ProductIndexRequest;
use App\Http\Resources\ProductDetailResource;
use App\Http\Resources\ProductResource;
use App\Services\ProductService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ProductController extends Controller
{
    public function __construct(private readonly ProductService $products) {}

    public function index(ProductIndexRequest $request): AnonymousResourceCollection
    {
        return ProductResource::collection($this->products->listAdmin($request->validated()));
    }

    public function show(int $product): ProductDetailResource
    {
        return new ProductDetailResource($this->products->findAdmin($product));
    }

    public function store(ProductRequest $request): JsonResponse
    {
        return ApiResponse::success(new ProductDetailResource($this->products->create($request->validated())), 'Đã tạo sản phẩm.', 201);
    }

    public function update(ProductRequest $request, int $product): ProductDetailResource
    {
        return new ProductDetailResource($this->products->update($product, $request->validated()));
    }

    public function updateStatus(ProductStatusRequest $request, int $product): ProductDetailResource
    {
        return new ProductDetailResource($this->products->setStatus($product, $request->validated('status')));
    }

    public function destroy(int $product): JsonResponse
    {
        $this->products->delete($product);

        return ApiResponse::success(null, 'Đã xóa sản phẩm.');
    }

    public function uploadThumbnail(ImageUploadRequest $request, int $product): ProductDetailResource
    {
        return new ProductDetailResource($this->products->uploadThumbnail($product, $request->file('image')));
    }

    public function addImage(ImageUploadRequest $request, int $product): JsonResponse
    {
        return ApiResponse::success(new ProductDetailResource($this->products->addImage($product, $request->file('image'))), 'Đã thêm ảnh.', 201);
    }

    public function removeImage(int $product, int $image): ProductDetailResource
    {
        return new ProductDetailResource($this->products->removeImage($product, $image));
    }
}
