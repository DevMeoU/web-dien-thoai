<?php

namespace App\Services;

use App\Exceptions\BusinessRuleException;
use App\Exceptions\ProductNotFoundException;
use App\Helpers\Slug;
use App\Interfaces\ProductRepositoryInterface;
use App\Models\Product;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class ProductService
{
    public function __construct(
        private readonly ProductRepositoryInterface $products,
        private readonly ImageService $images,
        private readonly InventoryService $inventory,
    ) {}

    public function listPublic(array $filters): LengthAwarePaginator
    {
        return $this->products->paginatePublic($filters);
    }

    public function listAdmin(array $filters): LengthAwarePaginator
    {
        return $this->products->paginateAdmin($filters);
    }

    /** Khách tìm theo id hoặc slug; sản phẩm ẩn hoặc ngừng bán trả về 404. */
    public function findPublic(string $key): Product
    {
        return $this->products->findActiveByKey($key) ?? throw new ProductNotFoundException;
    }

    public function related(string $key, int $limit = 4): Collection
    {
        return $this->products->related($this->findPublic($key), $limit);
    }

    public function findAdmin(int $id): Product
    {
        return $this->products->loadDetail($this->products->findOrFail($id));
    }

    public function create(array $data): Product
    {
        return DB::transaction(function () use ($data) {
            $variants = $data['variants'] ?? [];
            unset($data['variants']);

            $product = $this->products->create($this->prepare($data));
            if (! $product->code) {
                $product = $this->products->update($product, ['code' => 'SP'.str_pad((string) $product->id, 5, '0', STR_PAD_LEFT)]);
            }
            foreach ($variants as $variant) {
                $this->inventory->createVariant($product->id, $variant);
            }

            return $this->products->loadDetail($product);
        });
    }

    public function update(int $id, array $data): Product
    {
        unset($data['variants']);
        $product = $this->products->findOrFail($id);

        return $this->products->loadDetail($this->products->update($product, $this->prepare($data, $product)));
    }

    public function setStatus(int $id, string $status): Product
    {
        return $this->update($id, ['status' => $status]);
    }

    /** Sản phẩm đã có trong đơn hàng chỉ được ngừng bán, không được xóa để giữ lịch sử mua. */
    public function delete(int $id): void
    {
        $product = $this->products->findOrFail($id);
        if ($this->products->hasOrders($product)) {
            throw new BusinessRuleException('Sản phẩm đã có trong đơn hàng nên không thể xóa. Hãy chuyển sang trạng thái ngừng bán.', 409);
        }

        DB::transaction(function () use ($product) {
            $this->images->delete($product->thumbnail);
            foreach ($product->images as $image) {
                $this->images->delete($image->url);
            }
            $this->products->delete($product);
        });
    }

    public function uploadThumbnail(int $id, UploadedFile $file): Product
    {
        $product = $this->products->findOrFail($id);
        $path = $this->images->replace($product->thumbnail, $file, 'products');

        return $this->products->loadDetail($this->products->update($product, ['thumbnail' => $path]));
    }

    public function addImage(int $id, UploadedFile $file): Product
    {
        $product = $this->products->findOrFail($id);
        $this->products->addImage($product, $this->images->store($file, 'products'));

        return $this->products->loadDetail($product);
    }

    public function removeImage(int $id, int $imageId): Product
    {
        $product = $this->products->findOrFail($id);
        $image = $this->products->findImage($product, $imageId) ?? throw new BusinessRuleException('Không tìm thấy ảnh của sản phẩm.', 404);
        $this->images->delete($image->url);
        $this->products->deleteImage($image);

        return $this->products->loadDetail($product);
    }

    private function prepare(array $data, ?Product $current = null): array
    {
        if (! empty($data['slug']) || (! $current && ! empty($data['name']))) {
            $data['slug'] = Slug::unique(Product::class, $data['slug'] ?? $data['name'], $current?->id);
        }

        return $data;
    }
}
