<?php

namespace App\Repositories;

use App\Interfaces\UserRepositoryInterface;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;

class UserRepository extends BaseRepository implements UserRepositoryInterface
{
    protected function model(): string
    {
        return User::class;
    }

    protected function applyFilters(Builder $query, array $filters): void
    {
        $query->withCount('orders')
            ->when($filters['q'] ?? null, fn ($q, $term) => $q->where(fn ($sub) => $sub
                ->where('name', 'like', "%{$term}%")->orWhere('email', 'like', "%{$term}%")->orWhere('phone', 'like', "%{$term}%")))
            ->when($filters['role'] ?? null, fn ($q, $role) => $q->where('role', $role))
            ->when(isset($filters['is_active']), fn ($q) => $q->where('is_active', filter_var($filters['is_active'], FILTER_VALIDATE_BOOLEAN)))
            ->latest('id');
    }

    public function findByEmail(string $email): ?User
    {
        return $this->query()->where('email', $email)->first();
    }

    public function countAdmins(): int
    {
        return $this->query()->where('role', User::ROLE_ADMIN)->where('is_active', true)->count();
    }

    public function createCustomer(array $data): User
    {
        /** @var User $user */
        $user = $this->create($data);
        $user->forceFill(['role' => User::ROLE_USER, 'is_active' => true])->save();

        return $user->refresh();
    }

    public function setActive(User $user, bool $active): User
    {
        $user->forceFill(['is_active' => $active])->save();

        return $user->refresh();
    }

    public function setRole(User $user, string $role): User
    {
        $user->forceFill(['role' => $role])->save();

        return $user->refresh();
    }
}
