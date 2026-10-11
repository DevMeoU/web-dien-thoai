<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CartItem extends Model
{
    protected $fillable = ['cart_id', 'product_variant_id', 'quantity'];

    protected function casts(): array
    {
        return ['quantity' => 'integer'];
    }

    public function cart(): BelongsTo
    {
        return $this->belongsTo(Cart::class);
    }

    public function variant(): BelongsTo
    {
        return $this->belongsTo(ProductVariant::class, 'product_variant_id');
    }

    public function getUnitPriceAttribute(): string
    {
        return $this->variant->effective_price;
    }

    public function getLineTotalAttribute(): float
    {
        return round((float) $this->unit_price * $this->quantity, 2);
    }

    /** Vấn đề khiến dòng này chưa thể đặt hàng: unavailable, out_of_stock hoặc insufficient_stock. */
    public function issue(): ?string
    {
        $variant = $this->variant;
        if (! $variant->isPurchasable()) {
            return 'unavailable';
        }
        if ($variant->stock <= 0) {
            return 'out_of_stock';
        }

        return $variant->stock < $this->quantity ? 'insufficient_stock' : null;
    }
}
