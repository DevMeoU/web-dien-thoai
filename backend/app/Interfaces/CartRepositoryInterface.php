<?php

namespace App\Interfaces;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\User;

interface CartRepositoryInterface
{
    /** Giỏ hàng của người dùng (tự tạo nếu chưa có) kèm sản phẩm. */
    public function forUser(User $user): Cart;

    public function findItem(Cart $cart, int $itemId): ?CartItem;

    public function findItemByVariant(Cart $cart, int $variantId): ?CartItem;

    public function addItem(Cart $cart, int $variantId, int $quantity): CartItem;

    public function setQuantity(CartItem $item, int $quantity): CartItem;

    public function removeItem(CartItem $item): void;

    public function clear(Cart $cart): void;
}
