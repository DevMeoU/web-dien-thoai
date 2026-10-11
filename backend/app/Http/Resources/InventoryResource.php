<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** Một dòng tồn kho = một lựa chọn sản phẩm kèm tên sản phẩm. */
class InventoryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'sku' => $this->sku,
            'configuration' => $this->configuration,
            'color' => $this->color,
            'stock' => $this->stock,
            'is_active' => $this->is_active,
            'product' => $this->whenLoaded('product', fn () => [
                'id' => $this->product->id,
                'name' => $this->product->name,
                'status' => $this->product->status,
            ]),
        ];
    }
}
