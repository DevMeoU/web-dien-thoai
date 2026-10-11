<?php

namespace App\Http\Controllers\API\User;

use App\Http\Controllers\Controller;
use App\Http\Requests\ListRequest;
use App\Http\Resources\PostResource;
use App\Services\PostService;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

/** Tin tức công khai: chỉ bài đã xuất bản. */
class PostController extends Controller
{
    public function __construct(private readonly PostService $posts) {}

    public function index(ListRequest $request): AnonymousResourceCollection
    {
        return PostResource::collection($this->posts->listPublished($request->validated()));
    }

    public function show(string $slug): PostResource
    {
        return new PostResource($this->posts->findPublished($slug));
    }
}
