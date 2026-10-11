<?php

namespace App\Services;

use App\Interfaces\BannerRepositoryInterface;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;

class BannerService extends CrudService
{
    public function __construct(private readonly BannerRepositoryInterface $banners, private readonly ImageService $images)
    {
        parent::__construct($banners);
    }

    public function listActive(?string $position = null): Collection
    {
        return $this->banners->listActive($position);
    }

    public function uploadImage(int $id, UploadedFile $file): Model
    {
        $banner = $this->banners->findOrFail($id);

        return $this->banners->update($banner, ['image' => $this->images->replace($banner->image, $file, 'banners')]);
    }

    protected function guardDelete(Model $model): void
    {
        $this->images->delete($model->image);
    }
}
