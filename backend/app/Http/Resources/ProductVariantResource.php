<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductVariantResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'product_id' => $this->product_id,
            'sku' => $this->sku,
            'configuration' => $this->configuration,
            'color' => $this->color,
            'color_hex' => $this->color_hex,
            'price' => $this->effective_price,
            'own_price' => $this->price,
            'stock' => $this->stock,
            'image_url' => $this->image_url,
            'is_active' => $this->is_active,
        ];
    }
}
