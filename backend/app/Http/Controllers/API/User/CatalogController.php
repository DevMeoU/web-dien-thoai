<?php

namespace App\Http\Controllers\API\User;

use App\Http\Controllers\Controller;
use App\Http\Requests\ListRequest;
use App\Http\Resources\BannerResource;
use App\Http\Resources\BrandResource;
use App\Http\Resources\CategoryResource;
use App\Services\BannerService;
use App\Services\BrandService;
use App\Services\CategoryService;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

/** Dữ liệu công khai phục vụ menu và trang chủ: danh mục, thương hiệu, banner. */
class CatalogController extends Controller
{
    public function __construct(
        private readonly CategoryService $categories,
        private readonly BrandService $brands,
        private readonly BannerService $banners,
    ) {}

    public function categories(): AnonymousResourceCollection
    {
        return CategoryResource::collection($this->categories->tree(onlyActive: true));
    }

    public function brands(): AnonymousResourceCollection
    {
        return BrandResource::collection($this->brands->listActive());
    }

    public function banners(ListRequest $request): AnonymousResourceCollection
    {
        return BannerResource::collection($this->banners->listActive($request->validated('position')));
    }
}
