<?php

namespace App\Http\Controllers\API\User;

use App\Http\Controllers\Controller;
use App\Http\Requests\User\WishlistRequest;
use App\Http\Resources\ProductResource;
use App\Services\WishlistService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class WishlistController extends Controller
{
    public function __construct(private readonly WishlistService $wishlist) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        return ProductResource::collection($this->wishlist->list($request->user()));
    }

    public function store(WishlistRequest $request): AnonymousResourceCollection
    {
        return ProductResource::collection($this->wishlist->add($request->user(), $request->validated('product_id')));
    }

    public function destroy(Request $request, int $product): AnonymousResourceCollection
    {
        return ProductResource::collection($this->wishlist->remove($request->user(), $product));
    }
}
