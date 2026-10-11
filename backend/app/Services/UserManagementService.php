<?php

namespace App\Services;

use App\Exceptions\BusinessRuleException;
use App\Interfaces\OrderRepositoryInterface;
use App\Interfaces\UserRepositoryInterface;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

/** Quản trị khách hàng và tài khoản: xem hồ sơ, khóa/mở khóa, phân quyền. */
class UserManagementService
{
    public function __construct(
        private readonly UserRepositoryInterface $users,
        private readonly OrderRepositoryInterface $orders,
    ) {}

    public function list(array $filters): LengthAwarePaginator
    {
        return $this->users->paginate($filters);
    }

    /** Hồ sơ khách kèm lịch sử mua hàng gần đây. */
    public function detail(int $id): array
    {
        /** @var User $user */
        $user = $this->users->findOrFail($id);

        return [
            'user' => $user->loadCount('orders'),
            'recent_orders' => $this->orders->paginateAdmin(['user_id' => $user->id, 'per_page' => 5])->items(),
        ];
    }

    public function setActive(int $id, bool $active, User $actor): User
    {
        /** @var User $user */
        $user = $this->users->findOrFail($id);
        if ($user->id === $actor->id) {
            throw new BusinessRuleException('Bạn không thể tự khóa tài khoản của chính mình.');
        }
        if (! $active && $user->isAdmin() && $this->users->countAdmins() <= 1) {
            throw new BusinessRuleException('Không thể khóa quản trị viên cuối cùng.');
        }

        $user = $this->users->setActive($user, $active);
        if (! $active) {
            // Khóa tài khoản phải thu hồi mọi phiên đăng nhập đang có.
            $user->tokens()->delete();
        }

        return $user;
    }

    public function setRole(int $id, string $role, User $actor): User
    {
        /** @var User $user */
        $user = $this->users->findOrFail($id);
        if ($user->id === $actor->id) {
            throw new BusinessRuleException('Bạn không thể tự đổi vai trò của chính mình.');
        }
        if ($user->isAdmin() && $role !== User::ROLE_ADMIN && $this->users->countAdmins() <= 1) {
            throw new BusinessRuleException('Không thể hạ quyền quản trị viên cuối cùng.');
        }

        return $this->users->setRole($user, $role);
    }
}
