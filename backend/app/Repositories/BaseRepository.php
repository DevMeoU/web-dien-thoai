<?php

namespace App\Repositories;

use App\Exceptions\ResourceNotFoundException;
use App\Interfaces\RepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

/**
 * Repository dùng chung: các thao tác CRUD và phân trang.
 * Repository con chỉ cần khai báo model và (nếu cần) bộ lọc riêng.
 */
abstract class BaseRepository implements RepositoryInterface
{
    /** @return class-string<Model> */
    abstract protected function model(): string;

    protected function query(): Builder
    {
        return $this->model()::query();
    }

    /** Điều kiện lọc/tìm kiếm riêng của từng repository. */
    protected function applyFilters(Builder $query, array $filters): void {}

    public function find(int|string $id): ?Model
    {
        return $this->query()->find($id);
    }

    public function findOrFail(int|string $id): Model
    {
        return $this->find($id) ?? throw new ResourceNotFoundException;
    }

    public function create(array $data): Model
    {
        // refresh() nạp lại các giá trị mặc định do database đặt (ví dụ is_active, used_count).
        return $this->query()->create($data)->refresh();
    }

    public function update(Model $model, array $data): Model
    {
        $model->update($data);

        return $model->refresh();
    }

    public function delete(Model $model): void
    {
        $model->delete();
    }

    public function paginate(array $filters = [], ?int $perPage = null): LengthAwarePaginator
    {
        $query = $this->query();
        $this->applyFilters($query, $filters);

        return $query->paginate($perPage ?? (int) ($filters['per_page'] ?? 15))->withQueryString();
    }
}
