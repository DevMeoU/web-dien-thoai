<?php

namespace App\Models;

use App\Helpers\MediaUrl;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    use HasFactory;

    public const STATUS_ACTIVE = 'active';

    public const STATUS_HIDDEN = 'hidden';

    public const STATUS_DISCONTINUED = 'discontinued';

    public const STATUSES = [self::STATUS_ACTIVE, self::STATUS_HIDDEN, self::STATUS_DISCONTINUED];

    protected $fillable = [
        'name', 'slug', 'code', 'description', 'category_id', 'brand_id', 'price', 'compare_at_price',
        'thumbnail', 'tagline', 'option_label', 'highlights', 'specs', 'in_the_box', 'warranty',
        'collections', 'status', 'is_new', 'is_featured',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'compare_at_price' => 'decimal:2',
            'rating_avg' => 'decimal:2',
            'rating_count' => 'integer',
            'collections' => 'array',
            'highlights' => 'array',
            'specs' => 'array',
            'is_new' => 'boolean',
            'is_featured' => 'boolean',
        ];
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', self::STATUS_ACTIVE);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class)->orderBy('sort_order')->orderBy('id');
    }

    public function variants(): HasMany
    {
        return $this->hasMany(ProductVariant::class)->orderBy('id');
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    public function getThumbnailUrlAttribute(): ?string
    {
        return MediaUrl::resolve($this->thumbnail);
    }

    public function getIsOnSaleAttribute(): bool
    {
        return $this->compare_at_price !== null && (float) $this->compare_at_price > (float) $this->price;
    }

    public function getDiscountPercentAttribute(): int
    {
        return $this->is_on_sale ? (int) round((1 - (float) $this->price / (float) $this->compare_at_price) * 100) : 0;
    }

    /** Tổng tồn kho của các lựa chọn đang bán. */
    public function getTotalStockAttribute(): int
    {
        $variants = $this->relationLoaded('variants') ? $this->variants : $this->variants()->get();

        return (int) $variants->where('is_active', true)->sum('stock');
    }

    public function isPurchasable(): bool
    {
        return $this->status === self::STATUS_ACTIVE;
    }
}
