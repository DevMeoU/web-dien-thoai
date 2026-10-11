<?php

namespace App\Http\Controllers\API\User;

use App\Http\Controllers\Controller;
use App\Http\Requests\User\AddCartItemRequest;
use App\Http\Requests\User\UpdateCartItemRequest;
use App\Http\Resources\CartResource;
use App\Services\CartService;
use Illuminate\Http\Request;

class CartController extends Controller
{
    public function __construct(private readonly CartService $cart) {}

    public function show(Request $request): CartResource
    {
        return new CartResource($this->cart->get($request->user()));
    }

    public function addItem(AddCartItemRequest $request): CartResource
    {
        return new CartResource($this->cart->addItem($request->user(), $request->validated('product_variant_id'), $request->validated('quantity')));
    }

    public function updateItem(UpdateCartItemRequest $request, int $item): CartResource
    {
        return new CartResource($this->cart->updateItem($request->user(), $item, $request->validated('quantity')));
    }

    public function removeItem(Request $request, int $item): CartResource
    {
        return new CartResource($this->cart->removeItem($request->user(), $item));
    }

    public function clear(Request $request): CartResource
    {
        return new CartResource($this->cart->clear($request->user()));
    }
}
