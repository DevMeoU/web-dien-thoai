<?php

namespace App\Http\Controllers\API\Admin;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\CategoryRequest;
use App\Http\Requests\ImageUploadRequest;
use App\Http\Requests\ListRequest;
use App\Http\Resources\CategoryResource;
use App\Services\CategoryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class CategoryController extends Controller
{
    public function __construct(private readonly CategoryService $categories) {}

    public function index(ListRequest $request): AnonymousResourceCollection
    {
        return CategoryResource::collection($this->categories->list($request->validated()));
    }

    public function show(int $category): CategoryResource
    {
        return new CategoryResource($this->categories->find($category));
    }

    public function store(CategoryRequest $request): JsonResponse
    {
        return ApiResponse::success(new CategoryResource($this->categories->create($request->validated())), 'Đã tạo danh mục.', 201);
    }

    public function update(CategoryRequest $request, int $category): CategoryResource
    {
        return new CategoryResource($this->categories->update($category, $request->validated()));
    }

    public function destroy(int $category): JsonResponse
    {
        $this->categories->delete($category);

        return ApiResponse::success(null, 'Đã xóa danh mục.');
    }

    public function uploadImage(ImageUploadRequest $request, int $category): CategoryResource
    {
        return new CategoryResource($this->categories->uploadImage($category, $request->file('image')));
    }
}
