<?php

namespace App\Models;

use App\Helpers\MediaUrl;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Banner extends Model
{
    use HasFactory;

    protected $fillable = ['title', 'subtitle', 'image', 'link', 'position', 'sort_order', 'is_active'];

    public const POSITIONS = ['hero', 'collection'];

    protected function casts(): array
    {
        return ['is_active' => 'boolean', 'sort_order' => 'integer'];
    }

    public function getImageUrlAttribute(): ?string
    {
        return MediaUrl::resolve($this->image);
    }
}
