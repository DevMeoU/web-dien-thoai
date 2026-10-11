<?php

namespace App\Http\Controllers\API\User;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\ImageUploadRequest;
use App\Http\Requests\User\ChangePasswordRequest;
use App\Http\Requests\User\UpdateProfileRequest;
use App\Http\Resources\UserResource;
use App\Services\ProfileService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function __construct(private readonly ProfileService $profile) {}

    public function show(Request $request): UserResource
    {
        return new UserResource($request->user());
    }

    public function update(UpdateProfileRequest $request): UserResource
    {
        return new UserResource($this->profile->update($request->user(), $request->validated()));
    }

    public function changePassword(ChangePasswordRequest $request): JsonResponse
    {
        $this->profile->changePassword($request->user(), $request->validated('current_password'), $request->validated('password'));

        return ApiResponse::success(null, 'Đã đổi mật khẩu.');
    }

    public function uploadAvatar(ImageUploadRequest $request): UserResource
    {
        return new UserResource($this->profile->uploadAvatar($request->user(), $request->file('image')));
    }
}
