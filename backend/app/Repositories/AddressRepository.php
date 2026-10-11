<?php

namespace App\Repositories;

use App\Interfaces\AddressRepositoryInterface;
use App\Models\Address;
use App\Models\User;
use Illuminate\Support\Collection;

class AddressRepository extends BaseRepository implements AddressRepositoryInterface
{
    protected function model(): string
    {
        return Address::class;
    }

    public function listForUser(User $user): Collection
    {
        return $user->addresses()->orderByDesc('is_default')->orderByDesc('id')->get();
    }

    public function findForUser(User $user, int $id): ?Address
    {
        return $user->addresses()->whereKey($id)->first();
    }

    public function countForUser(User $user): int
    {
        return $user->addresses()->count();
    }

    public function clearDefault(User $user): void
    {
        $user->addresses()->where('is_default', true)->update(['is_default' => false]);
    }

    public function latestForUser(User $user): ?Address
    {
        return $user->addresses()->latest('id')->first();
    }
}
