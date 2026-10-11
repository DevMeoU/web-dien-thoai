<?php

namespace App\Interfaces;

use App\Models\Address;
use App\Models\User;
use Illuminate\Support\Collection;

interface AddressRepositoryInterface extends RepositoryInterface
{
    public function listForUser(User $user): Collection;

    public function findForUser(User $user, int $id): ?Address;

    public function countForUser(User $user): int;

    public function clearDefault(User $user): void;

    public function latestForUser(User $user): ?Address;
}
