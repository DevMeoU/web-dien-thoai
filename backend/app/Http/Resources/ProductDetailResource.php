<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;

class ProductDetailResource extends ProductResource
{
    public function toArray(Request $request): array
    {
        return [
            ...parent::toArray($request),
            'description' => $this->description,
            'option_label' => $this->option_label,
            'highlights' => $this->highlights ?? [],
            'specs' => $this->specs ?? [],
            'in_the_box' => $this->in_the_box,
            'warranty' => $this->warranty,
            'images' => $this->whenLoaded('images', fn () => $this->images->map(fn ($image) => [
                'id' => $image->id,
                'url' => $image->full_url,
                'sort_order' => $image->sort_order,
            ])->values()),
            'variants' => ProductVariantResource::collection($this->whenLoaded('variants')),
        ];
    }
}
