<?php

namespace App\Http\Controllers\API\Admin;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UserRoleRequest;
use App\Http\Requests\Admin\UserStatusRequest;
use App\Http\Requests\ListRequest;
use App\Http\Resources\OrderResource;
use App\Http\Resources\UserResource;
use App\Services\UserManagementService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class UserController extends Controller
{
    public function __construct(private readonly UserManagementService $users) {}

    public function index(ListRequest $request): AnonymousResourceCollection
    {
        return UserResource::collection($this->users->list($request->validated()));
    }

    public function show(int $user): JsonResponse
    {
        $detail = $this->users->detail($user);

        return ApiResponse::success([
            'user' => new UserResource($detail['user']),
            'recent_orders' => OrderResource::collection(collect($detail['recent_orders'])),
        ]);
    }

    public function updateStatus(UserStatusRequest $request, int $user): JsonResponse
    {
        $updated = $this->users->setActive($user, $request->boolean('is_active'), $request->user());

        return ApiResponse::success(new UserResource($updated), $updated->is_active ? 'Đã mở khóa tài khoản.' : 'Đã khóa tài khoản.');
    }

    public function updateRole(UserRoleRequest $request, int $user): JsonResponse
    {
        return ApiResponse::success(new UserResource($this->users->setRole($user, $request->validated('role'), $request->user())), 'Đã cập nhật vai trò.');
    }
}
