<?php

namespace App\Helpers;

use Illuminate\Support\Facades\Storage;

class MediaUrl
{
    /**
     * Đường dẫn bắt đầu bằng "/" hoặc "http" được giữ nguyên (ảnh tĩnh của frontend hoặc CDN);
     * còn lại là tệp tải lên nằm trong disk "public".
     */
    public static function resolve(?string $path): ?string
    {
        if ($path === null || $path === '') {
            return null;
        }
        if (str_starts_with($path, '/') || str_starts_with($path, 'http')) {
            return $path;
        }

        return Storage::disk('public')->url($path);
    }
}
