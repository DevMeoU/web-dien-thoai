<?php

namespace App\Http\Controllers\API\Admin;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\PostRequest;
use App\Http\Requests\ImageUploadRequest;
use App\Http\Requests\ListRequest;
use App\Http\Resources\PostResource;
use App\Services\PostService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class PostController extends Controller
{
    public function __construct(private readonly PostService $posts) {}

    public function index(ListRequest $request): AnonymousResourceCollection
    {
        return PostResource::collection($this->posts->list($request->validated()));
    }

    public function show(int $post): PostResource
    {
        return new PostResource($this->posts->find($post));
    }

    public function store(PostRequest $request): JsonResponse
    {
        return ApiResponse::success(new PostResource($this->posts->create($request->validated())), 'Đã tạo bài viết.', 201);
    }

    public function update(PostRequest $request, int $post): PostResource
    {
        return new PostResource($this->posts->update($post, $request->validated()));
    }

    public function destroy(int $post): JsonResponse
    {
        $this->posts->delete($post);

        return ApiResponse::success(null, 'Đã xóa bài viết.');
    }

    public function uploadImage(ImageUploadRequest $request, int $post): PostResource
    {
        return new PostResource($this->posts->uploadImage($post, $request->file('image')));
    }
}
