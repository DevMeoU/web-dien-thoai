<?php

namespace App\Http\Controllers\API\User;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\ListRequest;
use App\Http\Requests\User\CancelOrderRequest;
use App\Http\Requests\User\CouponCodeRequest;
use App\Http\Requests\User\PlaceOrderRequest;
use App\Http\Resources\CouponResource;
use App\Http\Resources\OrderResource;
use App\Services\CouponService;
use App\Services\OrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class OrderController extends Controller
{
    public function __construct(
        private readonly OrderService $orders,
        private readonly CouponService $coupons,
    ) {}

    /** Tính trước tạm tính, giảm giá, phí giao hàng và tổng tiền từ giỏ hàng hiện tại. */
    public function preview(CouponCodeRequest $request): JsonResponse
    {
        return ApiResponse::success($this->orders->preview($request->user(), $request->validated('coupon_code')));
    }

    /** Kiểm tra mã giảm giá với một số tiền tạm tính. */
    public function validateCoupon(CouponCodeRequest $request): JsonResponse
    {
        [$coupon, $discount] = $this->coupons->quote((string) $request->validated('code'), (float) $request->validated('subtotal', 0));

        return ApiResponse::success(['coupon' => new CouponResource($coupon), 'discount_amount' => $discount], 'Mã giảm giá hợp lệ.');
    }

    public function index(ListRequest $request): AnonymousResourceCollection
    {
        return OrderResource::collection($this->orders->listForUser($request->user(), $request->validated()));
    }

    public function show(Request $request, string $code): OrderResource
    {
        return new OrderResource($this->orders->findForUser($request->user(), $code));
    }

    public function store(PlaceOrderRequest $request): JsonResponse
    {
        $order = $this->orders->place($request->user(), $request->validated());

        return ApiResponse::success(new OrderResource($order), 'Đặt hàng thành công.', 201);
    }

    public function cancel(CancelOrderRequest $request, string $code): JsonResponse
    {
        $order = $this->orders->cancelByCustomer($request->user(), $code, $request->validated('reason'));

        return ApiResponse::success(new OrderResource($order), 'Đã hủy đơn hàng.');
    }
}
