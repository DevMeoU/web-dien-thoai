<?php

namespace App\Http\Controllers\API\Admin;

use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\OrderNoteRequest;
use App\Http\Requests\Admin\OrderStatusRequest;
use App\Http\Requests\ListRequest;
use App\Http\Resources\OrderResource;
use App\Services\OrderService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class OrderController extends Controller
{
    public function __construct(private readonly OrderService $orders) {}

    public function index(ListRequest $request): AnonymousResourceCollection
    {
        return OrderResource::collection($this->orders->listAdmin($request->validated()));
    }

    public function show(int $order): OrderResource
    {
        return new OrderResource($this->orders->detail($order));
    }

    public function updateStatus(OrderStatusRequest $request, int $order): OrderResource
    {
        $status = OrderStatus::from($request->validated('status'));

        return new OrderResource($this->orders->changeStatus($order, $status, $request->validated('note'), $request->user()));
    }

    public function updateNote(OrderNoteRequest $request, int $order): OrderResource
    {
        return new OrderResource($this->orders->updateAdminNote($order, $request->validated('admin_note')));
    }

    public function markPaid(Request $request, int $order): OrderResource
    {
        return new OrderResource($this->orders->markPaid($order, $request->user()));
    }
}
