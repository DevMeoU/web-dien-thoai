<?php

namespace App\Interfaces;

use App\Exceptions\ResourceNotFoundException;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Model;

interface RepositoryInterface
{
    public function find(int|string $id): ?Model;

    /** @throws ResourceNotFoundException */
    public function findOrFail(int|string $id): Model;

    public function create(array $data): Model;

    public function update(Model $model, array $data): Model;

    public function delete(Model $model): void;

    public function paginate(array $filters = [], ?int $perPage = null): LengthAwarePaginator;
}
