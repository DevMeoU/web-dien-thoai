<?php

namespace App\Services;

use App\Exceptions\ResourceNotFoundException;
use App\Interfaces\AddressRepositoryInterface;
use App\Models\Address;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

/** Sổ địa chỉ: luôn có tối đa một địa chỉ mặc định; địa chỉ đầu tiên tự là mặc định. */
class AddressService
{
    public function __construct(private readonly AddressRepositoryInterface $addresses) {}

    public function list(User $user): Collection
    {
        return $this->addresses->listForUser($user);
    }

    public function find(User $user, int $id): Address
    {
        return $this->addresses->findForUser($user, $id) ?? throw new ResourceNotFoundException('Không tìm thấy địa chỉ.');
    }

    public function create(User $user, array $data): Address
    {
        return DB::transaction(function () use ($user, $data) {
            $makeDefault = ($data['is_default'] ?? false) || $this->addresses->countForUser($user) === 0;
            if ($makeDefault) {
                $this->addresses->clearDefault($user);
            }

            return $this->addresses->create([...$data, 'user_id' => $user->id, 'is_default' => $makeDefault]);
        });
    }

    public function update(User $user, int $id, array $data): Address
    {
        return DB::transaction(function () use ($user, $id, $data) {
            $address = $this->find($user, $id);
            if ($data['is_default'] ?? false) {
                $this->addresses->clearDefault($user);
            } else {
                // Không cho bỏ cờ mặc định trực tiếp; hãy chọn địa chỉ khác làm mặc định.
                unset($data['is_default']);
            }

            return $this->addresses->update($address, $data);
        });
    }

    public function setDefault(User $user, int $id): Address
    {
        return $this->update($user, $id, ['is_default' => true]);
    }

    public function delete(User $user, int $id): void
    {
        DB::transaction(function () use ($user, $id) {
            $address = $this->find($user, $id);
            $this->addresses->delete($address);
            if ($address->is_default && ($next = $this->addresses->latestForUser($user))) {
                $this->addresses->update($next, ['is_default' => true]);
            }
        });
    }
}
