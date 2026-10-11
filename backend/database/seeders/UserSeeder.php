<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

/**
 * Tài khoản mẫu cho môi trường phát triển.
 * Quản trị: admin / adminadmin — Khách hàng: khach1@mela.vn ... khach5@mela.vn / Khach@12345.
 * Hãy đổi mật khẩu quản trị trước khi triển khai thật.
 */
class UserSeeder extends Seeder
{
    public function run(): void
    {
        $this->account('Quản trị viên Mela', 'admin', 'adminadmin', User::ROLE_ADMIN, '0901234567');

        if (app()->environment('production')) {
            return;
        }

        $names = ['Nguyễn Lan Anh', 'Trần Minh Khoa', 'Lê Thu Hà', 'Phạm Quốc Bảo', 'Võ Ngọc Mai'];
        foreach ($names as $index => $name) {
            $this->account($name, 'khach'.($index + 1).'@mela.vn', 'Khach@12345', User::ROLE_USER, '09'.str_pad((string) (11111110 + $index), 8, '0', STR_PAD_LEFT));
        }
    }

    private function account(string $name, string $email, string $password, string $role, string $phone): void
    {
        $user = User::query()->firstOrNew(['email' => $email]);
        $user->forceFill([
            'name' => $name, 'phone' => $phone, 'role' => $role, 'is_active' => true,
            'email_verified_at' => now(),
        ]);
        if (! $user->exists) {
            $user->password = $password;
        }
        $user->save();
    }
}
