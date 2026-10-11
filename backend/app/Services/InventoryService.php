<?php

namespace App\Services;

use App\Exceptions\BusinessRuleException;
use App\Interfaces\ProductVariantRepositoryInterface;
use App\Models\ProductVariant;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;

/** Quản lý phiên bản sản phẩm (cấu hình, màu) và tồn kho; tồn kho không bao giờ được âm. */
class InventoryService
{
    public function __construct(
        private readonly ProductVariantRepositoryInterface $variants,
        private readonly SettingService $settings,
        private readonly ImageService $images,
    ) {}

    public function listInventory(array $filters): LengthAwarePaginator
    {
        return $this->variants->paginateInventory($filters, $this->settings->lowStockThreshold());
    }

    public function lowStock(int $limit = 10): Collection
    {
        return $this->variants->lowStock($this->settings->lowStockThreshold(), $limit);
    }

    public function createVariant(int $productId, array $data): ProductVariant
    {
        return $this->variants->create([...$data, 'product_id' => $productId])->load('product');
    }

    public function updateVariant(int $id, array $data): ProductVariant
    {
        return $this->variants->update($this->variants->findOrFail($id), $data)->load('product');
    }

    public function deleteVariant(int $id): void
    {
        $variant = $this->variants->findOrFail($id);
        if ($this->variants->hasOrders($variant)) {
            throw new BusinessRuleException('Lựa chọn này đã có trong đơn hàng nên không thể xóa. Hãy tắt trạng thái bán.', 409);
        }
        $this->images->delete($variant->image);
        $this->variants->delete($variant);
    }

    public function uploadVariantImage(int $id, UploadedFile $file): ProductVariant
    {
        $variant = $this->variants->findOrFail($id);

        return $this->variants->update($variant, ['image' => $this->images->replace($variant->image, $file, 'variants')])->load('product');
    }

    public function setStock(int $id, int $stock): ProductVariant
    {
        return $this->variants->update($this->variants->findOrFail($id), ['stock' => $stock])->load('product');
    }

    /**
     * Trừ kho cho các dòng đơn hàng. Phải gọi trong transaction với các dòng đã khóa để tránh bán vượt tồn.
     *
     * @param  Collection<int, ProductVariant>  $lockedVariants  keyBy id
     * @param  array<int, int>  $quantities  variant id => số lượng
     */
    public function decrease(Collection $lockedVariants, array $quantities): void
    {
        foreach ($quantities as $variantId => $quantity) {
            $variant = $lockedVariants[$variantId];
            if ($variant->stock < $quantity) {
                throw new BusinessRuleException("Sản phẩm {$variant->product->name} ({$variant->sku}) không đủ tồn kho.");
            }
            $this->variants->adjustStock($variant, -$quantity);
        }
    }

    /** Hoàn tồn khi đơn bị hủy. */
    public function restore(array $quantities): void
    {
        $locked = $this->variants->lockForUpdate(array_keys($quantities));
        foreach ($quantities as $variantId => $quantity) {
            if (isset($locked[$variantId])) {
                $this->variants->adjustStock($locked[$variantId], $quantity);
            }
        }
    }

    public function lock(array $variantIds): Collection
    {
        return $this->variants->lockForUpdate($variantIds);
    }
}
