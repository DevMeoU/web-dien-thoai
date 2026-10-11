<?php

namespace App\Services;

use App\Exceptions\BusinessRuleException;
use App\Interfaces\ProductRepositoryInterface;
use App\Interfaces\WishlistRepositoryInterface;
use App\Models\User;
use Illuminate\Support\Collection;

class WishlistService
{
    public function __construct(
        private readonly WishlistRepositoryInterface $wishlist,
        private readonly ProductRepositoryInterface $products,
    ) {}

    public function list(User $user): Collection
    {
        return $this->wishlist->listForUser($user);
    }

    public function add(User $user, int $productId): Collection
    {
        $product = $this->products->findOrFail($productId);
        if (! $product->isPurchasable()) {
            throw new BusinessRuleException('Sản phẩm này hiện không được bán nên không thể thêm vào yêu thích.');
        }
        $this->wishlist->add($user, $productId);

        return $this->list($user);
    }

    public function remove(User $user, int $productId): Collection
    {
        $this->wishlist->remove($user, $productId);

        return $this->list($user);
    }
}
