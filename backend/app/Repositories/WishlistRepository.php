<?php

namespace App\Repositories;

use App\Interfaces\WishlistRepositoryInterface;
use App\Models\User;
use Illuminate\Support\Collection;

class WishlistRepository implements WishlistRepositoryInterface
{
    public function listForUser(User $user): Collection
    {
        // Giữ cả sản phẩm đã ẩn/ngừng bán để giao diện báo "không còn bán" thay vì tự biến mất.
        return $user->wishlistProducts()->with(['category', 'brand', 'variants'])
            ->orderByPivot('created_at', 'desc')->get();
    }

    public function add(User $user, int $productId): void
    {
        $user->wishlistProducts()->syncWithoutDetaching([$productId]);
    }

    public function remove(User $user, int $productId): void
    {
        $user->wishlistProducts()->detach($productId);
    }
}
