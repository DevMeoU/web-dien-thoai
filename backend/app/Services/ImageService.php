<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

/** Lưu và xóa ảnh tải lên (disk "public"). Ảnh tĩnh của frontend (đường dẫn "/...") không bị đụng tới. */
class ImageService
{
    public function store(UploadedFile $file, string $directory): string
    {
        return $file->store($directory, 'public');
    }

    public function delete(?string $path): void
    {
        if ($path && ! str_starts_with($path, '/') && ! str_starts_with($path, 'http')) {
            Storage::disk('public')->delete($path);
        }
    }

    /** Thay ảnh cũ bằng ảnh mới và trả về đường dẫn mới. */
    public function replace(?string $old, UploadedFile $file, string $directory): string
    {
        $this->delete($old);

        return $this->store($file, $directory);
    }
}
