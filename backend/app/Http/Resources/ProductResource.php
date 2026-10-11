<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $variants = $this->relationLoaded('variants') ? $this->variants->where('is_active', true) : collect();

        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'code' => $this->code,
            'price' => $this->price,
            'compare_at_price' => $this->compare_at_price,
            'is_on_sale' => $this->is_on_sale,
            'discount_percent' => $this->discount_percent,
            'thumbnail_url' => $this->thumbnail_url,
            'status' => $this->status,
            'is_new' => $this->is_new,
            'is_featured' => $this->is_featured,
            'collections' => $this->collections ?? [],
            'rating_avg' => (float) $this->rating_avg,
            'rating_count' => $this->rating_count,
            'category' => $this->whenLoaded('category', fn () => $this->category ? ['id' => $this->category->id, 'name' => $this->category->name, 'slug' => $this->category->slug] : null),
            'brand' => $this->whenLoaded('brand', fn () => $this->brand ? ['id' => $this->brand->id, 'name' => $this->brand->name, 'slug' => $this->brand->slug] : null),
            'total_stock' => $this->total_stock,
            'tagline' => $this->tagline,
            'in_stock' => $this->total_stock > 0,
            'configurations' => $variants->pluck('configuration')->filter()->unique()->values(),
            'colors' => $variants->filter(fn ($v) => $v->color)->unique('color')->map(fn ($v) => ['value' => $v->color, 'hex' => $v->color_hex])->values(),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
