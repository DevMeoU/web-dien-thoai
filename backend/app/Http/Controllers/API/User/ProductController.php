<?php

namespace App\Http\Controllers\API\User;

use App\Http\Controllers\Controller;
use App\Http\Requests\ProductIndexRequest;
use App\Http\Resources\ProductDetailResource;
use App\Http\Resources\ProductResource;
use App\Services\ProductService;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ProductController extends Controller
{
    public function __construct(private readonly ProductService $products) {}

    public function index(ProductIndexRequest $request): AnonymousResourceCollection
    {
        return ProductResource::collection($this->products->listPublic($request->validated()));
    }

    /** Tìm theo id hoặc slug. */
    public function show(string $productKey): ProductDetailResource
    {
        return new ProductDetailResource($this->products->findPublic($productKey));
    }

    public function related(string $productKey): AnonymousResourceCollection
    {
        return ProductResource::collection($this->products->related($productKey));
    }
}
