<?php

namespace App\Services;

use App\Exceptions\BusinessRuleException;
use App\Interfaces\UserRepositoryInterface;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;

class ProfileService
{
    public function __construct(
        private readonly UserRepositoryInterface $users,
        private readonly ImageService $images,
    ) {}

    public function update(User $user, array $data): User
    {
        return $this->users->update($user, array_intersect_key($data, array_flip(['name', 'phone'])));
    }

    public function changePassword(User $user, string $current, string $new): void
    {
        if (! Hash::check($current, $user->password)) {
            throw new BusinessRuleException('Mật khẩu hiện tại không chính xác.', 422, ['current_password' => ['Mật khẩu hiện tại không chính xác.']]);
        }

        $this->users->update($user, ['password' => $new]);
        // Đổi mật khẩu thì đăng xuất các thiết bị khác, giữ lại phiên hiện tại.
        $user->tokens()->where('id', '!=', $user->currentAccessToken()?->id)->delete();
    }

    public function uploadAvatar(User $user, UploadedFile $file): User
    {
        return $this->users->update($user, ['avatar' => $this->images->replace($user->avatar, $file, 'avatars')]);
    }
}
