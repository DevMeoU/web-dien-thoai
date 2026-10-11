<?php

namespace App\Services;

use App\Exceptions\BusinessRuleException;
use App\Interfaces\CartRepositoryInterface;
use App\Interfaces\ProductVariantRepositoryInterface;
use App\Models\Cart;
use App\Models\ProductVariant;
use App\Models\User;

/** Giỏ hàng lưu theo tài khoản; luôn kiểm tra tồn kho khi thêm hoặc đổi số lượng. */
class CartService
{
    public const MAX_QUANTITY_PER_LINE = 99;

    public function __construct(
        private readonly CartRepositoryInterface $carts,
        private readonly ProductVariantRepositoryInterface $variants,
    ) {}

    public function get(User $user): Cart
    {
        return $this->carts->forUser($user);
    }

    public function addItem(User $user, int $variantId, int $quantity): Cart
    {
        $variant = $this->purchasableVariant($variantId);
        $cart = $this->carts->forUser($user);
        $existing = $this->carts->findItemByVariant($cart, $variantId);
        $total = ($existing?->quantity ?? 0) + $quantity;
        $this->assertQuantity($variant, $total);

        $existing ? $this->carts->setQuantity($existing, $total) : $this->carts->addItem($cart, $variantId, $total);

        return $this->carts->forUser($user);
    }

    public function updateItem(User $user, int $itemId, int $quantity): Cart
    {
        $cart = $this->carts->forUser($user);
        $item = $this->carts->findItem($cart, $itemId) ?? throw new BusinessRuleException('Không tìm thấy sản phẩm trong giỏ hàng.', 404);
        $this->assertQuantity($this->purchasableVariant($item->product_variant_id), $quantity);
        $this->carts->setQuantity($item, $quantity);

        return $this->carts->forUser($user);
    }

    public function removeItem(User $user, int $itemId): Cart
    {
        $cart = $this->carts->forUser($user);
        $item = $this->carts->findItem($cart, $itemId) ?? throw new BusinessRuleException('Không tìm thấy sản phẩm trong giỏ hàng.', 404);
        $this->carts->removeItem($item);

        return $this->carts->forUser($user);
    }

    public function clear(User $user): Cart
    {
        $cart = $this->carts->forUser($user);
        $this->carts->clear($cart);

        return $this->carts->forUser($user);
    }

    private function purchasableVariant(int $variantId): ProductVariant
    {
        $variant = $this->variants->findOrFail($variantId);
        $variant->loadMissing('product');
        if (! $variant->isPurchasable()) {
            throw new BusinessRuleException('Sản phẩm này hiện không được bán.');
        }

        return $variant;
    }

    private function assertQuantity(ProductVariant $variant, int $quantity): void
    {
        if ($quantity > $variant->stock) {
            throw new BusinessRuleException($variant->stock > 0
                ? "Chỉ còn {$variant->stock} sản phẩm trong kho."
                : 'Sản phẩm này đã hết hàng.');
        }
        if ($quantity > self::MAX_QUANTITY_PER_LINE) {
            throw new BusinessRuleException('Số lượng tối đa cho mỗi sản phẩm là '.self::MAX_QUANTITY_PER_LINE.'.');
        }
    }
}
