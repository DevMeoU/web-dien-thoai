<?php

namespace App\Repositories;

use App\Interfaces\CartRepositoryInterface;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\User;

class CartRepository implements CartRepositoryInterface
{
    public function forUser(User $user): Cart
    {
        $cart = Cart::query()->firstOrCreate(['user_id' => $user->id]);

        return $cart->load('items.variant.product');
    }

    public function findItem(Cart $cart, int $itemId): ?CartItem
    {
        return $cart->items()->whereKey($itemId)->first();
    }

    public function findItemByVariant(Cart $cart, int $variantId): ?CartItem
    {
        return $cart->items()->where('product_variant_id', $variantId)->first();
    }

    public function addItem(Cart $cart, int $variantId, int $quantity): CartItem
    {
        return $cart->items()->create(['product_variant_id' => $variantId, 'quantity' => $quantity]);
    }

    public function setQuantity(CartItem $item, int $quantity): CartItem
    {
        $item->update(['quantity' => $quantity]);

        return $item;
    }

    public function removeItem(CartItem $item): void
    {
        $item->delete();
    }

    public function clear(Cart $cart): void
    {
        $cart->items()->delete();
    }
}
