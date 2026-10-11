<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CartResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $items = $this->items;

        return [
            'id' => $this->id,
            'items' => $items->map(fn ($item) => [
                'id' => $item->id,
                'quantity' => $item->quantity,
                'unit_price' => $item->unit_price,
                'line_total' => $item->line_total,
                'available_stock' => $item->variant->stock,
                'issue' => $item->issue(),
                'variant' => new ProductVariantResource($item->variant),
                'product' => [
                    'id' => $item->variant->product->id,
                    'name' => $item->variant->product->name,
                    'slug' => $item->variant->product->slug,
                    'thumbnail_url' => $item->variant->image_url,
                ],
            ])->values(),
            'item_count' => (int) $items->sum('quantity'),
            'subtotal' => round((float) $items->sum(fn ($item) => $item->line_total), 2),
            'has_issues' => $items->contains(fn ($item) => $item->issue() !== null),
        ];
    }
}
