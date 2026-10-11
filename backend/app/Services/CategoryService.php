<?php

namespace App\Services;

use App\Exceptions\BusinessRuleException;
use App\Helpers\Slug;
use App\Interfaces\CategoryRepositoryInterface;
use App\Models\Category;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;

class CategoryService extends CrudService
{
    public function __construct(private readonly CategoryRepositoryInterface $categories, private readonly ImageService $images)
    {
        parent::__construct($categories);
    }

    public function tree(bool $onlyActive = true): Collection
    {
        return $this->categories->tree($onlyActive);
    }

    protected function prepare(array $data, ?Model $current = null): array
    {
        $this->guardParent($data['parent_id'] ?? null, $current);

        if (! empty($data['slug']) || (! $current && ! empty($data['name']))) {
            $data['slug'] = Slug::unique(Category::class, $data['slug'] ?? $data['name'], $current?->id);
        }

        return $data;
    }

    /** Danh mục chỉ có hai cấp: cha và con. */
    private function guardParent(?int $parentId, ?Model $current): void
    {
        if ($parentId === null) {
            return;
        }
        if ($current && $parentId === $current->id) {
            throw new BusinessRuleException('Danh mục không thể là cha của chính nó.');
        }
        $parent = $this->categories->findOrFail($parentId);
        if ($parent->parent_id !== null) {
            throw new BusinessRuleException('Chỉ hỗ trợ danh mục cha và danh mục con (hai cấp).');
        }
        if ($current && $this->categories->childCount($current) > 0) {
            throw new BusinessRuleException('Danh mục đang có danh mục con nên không thể chuyển thành danh mục con.');
        }
    }

    protected function guardDelete(Model $model): void
    {
        if ($this->categories->productCount($model) > 0) {
            throw new BusinessRuleException('Danh mục đang có sản phẩm. Hãy chuyển sản phẩm sang danh mục khác hoặc ẩn danh mục.', 409);
        }
        if ($this->categories->childCount($model) > 0) {
            throw new BusinessRuleException('Danh mục đang có danh mục con. Hãy xóa hoặc chuyển danh mục con trước.', 409);
        }
    }

    public function uploadImage(int $id, UploadedFile $file): Model
    {
        $category = $this->categories->findOrFail($id);

        return $this->categories->update($category, ['image' => $this->images->replace($category->image, $file, 'categories')]);
    }
}
