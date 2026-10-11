<?php

namespace App\Http\Controllers\API\User;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\ListRequest;
use App\Http\Requests\User\StoreReviewRequest;
use App\Http\Resources\ReviewResource;
use App\Services\ReviewService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ReviewController extends Controller
{
    public function __construct(private readonly ReviewService $reviews) {}

    /** Đánh giá công khai của sản phẩm kèm điểm trung bình và phân bố số sao. */
    public function forProduct(ListRequest $request, string $productKey): JsonResponse
    {
        $result = $this->reviews->forProduct($productKey, $request->validated());

        return ApiResponse::success([
            'summary' => $result['summary'],
            'reviews' => ReviewResource::collection($result['reviews'])->response()->getData(true),
        ]);
    }

    /** Nhận xét nổi bật cho trang chủ. */
    public function featured(): AnonymousResourceCollection
    {
        return ReviewResource::collection($this->reviews->featured());
    }

    public function mine(Request $request): AnonymousResourceCollection
    {
        return ReviewResource::collection($this->reviews->mine($request->user()));
    }

    /** Các sản phẩm đã nhận hàng và chưa được đánh giá. */
    public function eligible(Request $request): JsonResponse
    {
        return ApiResponse::success($this->reviews->eligible($request->user())->map(fn ($item) => [
            'order_item_id' => $item->id,
            'order_code' => $item->order->code,
            'product_id' => $item->product_id,
            'product_name' => $item->product_name,
            'configuration' => $item->configuration,
            'color' => $item->color,
            'image_url' => $item->image_url,
        ])->values());
    }

    public function store(StoreReviewRequest $request): JsonResponse
    {
        return ApiResponse::success(new ReviewResource($this->reviews->create($request->user(), $request->validated())), 'Cảm ơn bạn đã đánh giá.', 201);
    }

    public function update(StoreReviewRequest $request, int $review): ReviewResource
    {
        return new ReviewResource($this->reviews->update($request->user(), $review, $request->validated()));
    }

    public function destroy(Request $request, int $review): JsonResponse
    {
        $this->reviews->delete($request->user(), $review);

        return ApiResponse::success(null, 'Đã xóa đánh giá.');
    }
}
