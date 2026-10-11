<?php

namespace App\Http\Controllers\API\Admin;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StockRequest;
use App\Http\Requests\Admin\VariantRequest;
use App\Http\Requests\ImageUploadRequest;
use App\Http\Requests\ListRequest;
use App\Http\Resources\InventoryResource;
use App\Http\Resources\ProductVariantResource;
use App\Services\InventoryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

/** Lựa chọn sản phẩm (dung lượng/cấu hình, màu) và tồn kho. */
class InventoryController extends Controller
{
    public function __construct(private readonly InventoryService $inventory) {}

    public function index(ListRequest $request): AnonymousResourceCollection
    {
        return InventoryResource::collection($this->inventory->listInventory($request->validated()));
    }

    public function updateStock(StockRequest $request, int $variant): InventoryResource
    {
        return new InventoryResource($this->inventory->setStock($variant, $request->validated('stock')));
    }

    public function storeVariant(VariantRequest $request, int $product): JsonResponse
    {
        return ApiResponse::success(new ProductVariantResource($this->inventory->createVariant($product, $request->validated())), 'Đã thêm lựa chọn sản phẩm.', 201);
    }

    public function updateVariant(VariantRequest $request, int $variant): ProductVariantResource
    {
        return new ProductVariantResource($this->inventory->updateVariant($variant, $request->validated()));
    }

    public function uploadVariantImage(ImageUploadRequest $request, int $variant): ProductVariantResource
    {
        return new ProductVariantResource($this->inventory->uploadVariantImage($variant, $request->file('image')));
    }

    public function destroyVariant(int $variant): JsonResponse
    {
        $this->inventory->deleteVariant($variant);

        return ApiResponse::success(null, 'Đã xóa lựa chọn sản phẩm.');
    }
}
