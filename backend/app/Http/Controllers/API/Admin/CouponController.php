<?php

namespace App\Http\Controllers\API\Admin;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\CouponRequest;
use App\Http\Requests\ListRequest;
use App\Http\Resources\CouponResource;
use App\Services\CouponService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class CouponController extends Controller
{
    public function __construct(private readonly CouponService $coupons) {}

    public function index(ListRequest $request): AnonymousResourceCollection
    {
        return CouponResource::collection($this->coupons->list($request->validated()));
    }

    public function show(int $coupon): CouponResource
    {
        return new CouponResource($this->coupons->find($coupon));
    }

    public function store(CouponRequest $request): JsonResponse
    {
        return ApiResponse::success(new CouponResource($this->coupons->create($request->validated())), 'Đã tạo mã giảm giá.', 201);
    }

    public function update(CouponRequest $request, int $coupon): CouponResource
    {
        return new CouponResource($this->coupons->update($coupon, $request->validated()));
    }

    public function destroy(int $coupon): JsonResponse
    {
        $this->coupons->delete($coupon);

        return ApiResponse::success(null, 'Đã xóa mã giảm giá.');
    }
}
