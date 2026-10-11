<?php

namespace App\Services;

use App\Interfaces\RepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Model;

/** Service CRUD dùng chung cho các module quản trị đơn giản (danh mục, thương hiệu, banner...). */
abstract class CrudService
{
    public function __construct(protected readonly RepositoryInterface $repository) {}

    public function list(array $filters): LengthAwarePaginator
    {
        return $this->repository->paginate($filters);
    }

    public function find(int $id): Model
    {
        return $this->repository->findOrFail($id);
    }

    public function create(array $data): Model
    {
        return $this->repository->create($this->prepare($data));
    }

    public function update(int $id, array $data): Model
    {
        $model = $this->repository->findOrFail($id);

        return $this->repository->update($model, $this->prepare($data, $model));
    }

    public function delete(int $id): void
    {
        $model = $this->repository->findOrFail($id);
        $this->guardDelete($model);
        $this->repository->delete($model);
    }

    /** Chuẩn hóa dữ liệu trước khi lưu (ví dụ sinh slug). */
    protected function prepare(array $data, ?Model $current = null): array
    {
        return $data;
    }

    /** Ném BusinessRuleException nếu không được phép xóa. */
    protected function guardDelete(Model $model): void {}
}
