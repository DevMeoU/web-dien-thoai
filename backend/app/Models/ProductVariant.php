<?php

namespace App\Models;

use App\Helpers\MediaUrl;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductVariant extends Model
{
    use HasFactory;

    protected $fillable = ['product_id', 'sku', 'configuration', 'color', 'color_hex', 'price', 'stock', 'image', 'is_active'];

    protected function casts(): array
    {
        return ['price' => 'decimal:2', 'stock' => 'integer', 'is_active' => 'boolean'];
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /** Giá bán thực tế: giá riêng của lựa chọn hoặc giá của sản phẩm. */
    public function getEffectivePriceAttribute(): string
    {
        return $this->price ?? $this->product->price;
    }

    public function getImageUrlAttribute(): ?string
    {
        return MediaUrl::resolve($this->image ?? $this->product?->thumbnail);
    }

    public function isPurchasable(): bool
    {
        return $this->is_active && $this->product?->isPurchasable();
    }
}
