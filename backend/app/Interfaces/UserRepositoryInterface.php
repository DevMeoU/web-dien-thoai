<?php

namespace App\Interfaces;

use App\Models\User;

interface UserRepositoryInterface extends RepositoryInterface
{
    public function findByEmail(string $email): ?User;

    public function countAdmins(): int;

    /** Tạo tài khoản khách hàng (vai trò user, đang hoạt động). */
    public function createCustomer(array $data): User;

    /** Các thuộc tính đặc quyền không nằm trong $fillable nên cần phương thức riêng. */
    public function setActive(User $user, bool $active): User;

    public function setRole(User $user, string $role): User;
}
