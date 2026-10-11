<?php

namespace App\Http\Controllers\API\User;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\User\AddressRequest;
use App\Http\Resources\AddressResource;
use App\Services\AddressService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class AddressController extends Controller
{
    public function __construct(private readonly AddressService $addresses) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        return AddressResource::collection($this->addresses->list($request->user()));
    }

    public function store(AddressRequest $request): JsonResponse
    {
        return ApiResponse::success(new AddressResource($this->addresses->create($request->user(), $request->validated())), 'Đã thêm địa chỉ.', 201);
    }

    public function show(Request $request, int $address): AddressResource
    {
        return new AddressResource($this->addresses->find($request->user(), $address));
    }

    public function update(AddressRequest $request, int $address): AddressResource
    {
        return new AddressResource($this->addresses->update($request->user(), $address, $request->validated()));
    }

    public function setDefault(Request $request, int $address): AddressResource
    {
        return new AddressResource($this->addresses->setDefault($request->user(), $address));
    }

    public function destroy(Request $request, int $address): JsonResponse
    {
        $this->addresses->delete($request->user(), $address);

        return ApiResponse::success(null, 'Đã xóa địa chỉ.');
    }
}
