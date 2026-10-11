<?php

namespace App\Services;

use App\Exceptions\BusinessRuleException;
use App\Helpers\Slug;
use App\Interfaces\BrandRepositoryInterface;
use App\Models\Brand;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;

class BrandService extends CrudService
{
    public function __construct(private readonly BrandRepositoryInterface $brands, private readonly ImageService $images)
    {
        parent::__construct($brands);
    }

    public function listActive(): Collection
    {
        return $this->brands->listActive();
    }

    protected function prepare(array $data, ?Model $current = null): array
    {
        if (! empty($data['slug']) || (! $current && ! empty($data['name']))) {
            $data['slug'] = Slug::unique(Brand::class, $data['slug'] ?? $data['name'], $current?->id);
        }

        return $data;
    }

    protected function guardDelete(Model $model): void
    {
        if ($this->brands->productCount($model) > 0) {
            throw new BusinessRuleException('Thương hiệu đang có sản phẩm. Hãy chuyển sản phẩm sang thương hiệu khác hoặc ẩn thương hiệu.', 409);
        }
    }

    public function uploadImage(int $id, UploadedFile $file): Model
    {
        $brand = $this->brands->findOrFail($id);

        return $this->brands->update($brand, ['image' => $this->images->replace($brand->image, $file, 'brands')]);
    }
}
