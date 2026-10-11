<?php

namespace App\Http\Controllers\API\Admin;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ReportRequest;
use App\Http\Resources\InventoryResource;
use App\Http\Resources\OrderResource;
use App\Services\DashboardService;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function __construct(private readonly DashboardService $dashboard) {}

    public function __invoke(ReportRequest $request): JsonResponse
    {
        $data = $this->dashboard->overview($request->validated('from'), $request->validated('to'));
        $data['recent_orders'] = OrderResource::collection($data['recent_orders']);
        $data['low_stock'] = InventoryResource::collection($data['low_stock']);

        return ApiResponse::success($data);
    }
}
