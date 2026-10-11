<?php

namespace App\Interfaces;

use App\Models\Category;
use Illuminate\Support\Collection;

interface CategoryRepositoryInterface extends RepositoryInterface
{
    /** Danh mục cha kèm danh mục con theo thứ tự hiển thị. */
    public function tree(bool $onlyActive): Collection;

    public function productCount(Category $category): int;

    public function childCount(Category $category): int;

    /** @return list<int> id của danh mục và toàn bộ danh mục con. */
    public function selfAndDescendantIds(Category $category): array;
}
