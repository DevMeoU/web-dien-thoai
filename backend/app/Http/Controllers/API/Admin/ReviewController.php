<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ReviewReplyRequest;
use App\Http\Requests\Admin\ReviewVisibilityRequest;
use App\Http\Requests\ListRequest;
use App\Http\Resources\ReviewResource;
use App\Services\ReviewService;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ReviewController extends Controller
{
    public function __construct(private readonly ReviewService $reviews) {}

    public function index(ListRequest $request): AnonymousResourceCollection
    {
        return ReviewResource::collection($this->reviews->listAdmin($request->validated()));
    }

    public function updateVisibility(ReviewVisibilityRequest $request, int $review): ReviewResource
    {
        return new ReviewResource($this->reviews->setVisibility($review, $request->boolean('is_visible')));
    }

    public function reply(ReviewReplyRequest $request, int $review): ReviewResource
    {
        return new ReviewResource($this->reviews->reply($review, $request->validated('reply')));
    }
}
