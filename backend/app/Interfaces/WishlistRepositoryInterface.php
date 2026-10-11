<?php

namespace App\Interfaces;

use App\Models\User;
use Illuminate\Support\Collection;

interface WishlistRepositoryInterface
{
    public function listForUser(User $user): Collection;

    public function add(User $user, int $productId): void;

    public function remove(User $user, int $productId): void;
}
