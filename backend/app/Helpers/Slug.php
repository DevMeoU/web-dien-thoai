<?php

namespace App\Helpers;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Slug
{
    /** Tạo slug duy nhất cho model, thêm hậu tố -2, -3... khi bị trùng. */
    public static function unique(string $modelClass, string $text, ?int $ignoreId = null): string
    {
        $base = Str::slug($text) ?: 'muc';
        $slug = $base;
        $counter = 2;

        while (static::exists($modelClass, $slug, $ignoreId)) {
            $slug = $base.'-'.$counter++;
        }

        return $slug;
    }

    private static function exists(string $modelClass, string $slug, ?int $ignoreId): bool
    {
        /** @var Model $model */
        $model = new $modelClass;

        return $model->newQuery()->where('slug', $slug)
            ->when($ignoreId, fn ($query) => $query->whereKeyNot($ignoreId))
            ->exists();
    }
}
