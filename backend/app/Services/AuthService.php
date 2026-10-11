<?php

namespace App\Services;

use App\Exceptions\BusinessRuleException;
use App\Interfaces\UserRepositoryInterface;
use App\Models\User;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;

class AuthService
{
    public function __construct(private readonly UserRepositoryInterface $users) {}

    /** @return array{user: User, token: string} */
    public function register(array $data): array
    {
        $user = $this->users->createCustomer([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => $data['password'],
            'phone' => $data['phone'] ?? null,
        ]);

        return ['user' => $user, 'token' => $this->issueToken($user)];
    }

    /** @return array{user: User, token: string} */
    public function login(string $email, string $password): array
    {
        $user = $this->users->findByEmail($email);
        // Thông báo chung cho cả sai tài khoản lẫn sai mật khẩu để không lộ tài khoản nào đã đăng ký.
        if (! $user || ! Hash::check($password, $user->password)) {
            throw new BusinessRuleException('Tài khoản hoặc mật khẩu không chính xác.', 401);
        }
        if (! $user->is_active) {
            throw new BusinessRuleException('Tài khoản của bạn đã bị khóa. Vui lòng liên hệ cửa hàng.', 403);
        }

        return ['user' => $user, 'token' => $this->issueToken($user)];
    }

    public function logout(User $user): void
    {
        $user->currentAccessToken()?->delete();
    }

    /** Luôn trả kết quả giống nhau dù email có tồn tại hay không. */
    public function sendResetLink(string $email): void
    {
        Password::sendResetLink(['email' => $email]);
    }

    public function resetPassword(array $data): void
    {
        $status = Password::reset(
            ['email' => $data['email'], 'token' => $data['token'], 'password' => $data['password'], 'password_confirmation' => $data['password_confirmation']],
            function (User $user, string $password): void {
                $user->forceFill(['password' => $password, 'remember_token' => Str::random(60)])->save();
                $user->tokens()->delete();
                event(new PasswordReset($user));
            },
        );

        if ($status !== Password::PASSWORD_RESET) {
            throw new BusinessRuleException('Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.');
        }
    }

    private function issueToken(User $user): string
    {
        return $user->createToken('web')->plainTextToken;
    }
}
