<?php

namespace App\Services;

use App\Exceptions\ResourceNotFoundException;
use App\Interfaces\ContentPageRepositoryInterface;
use App\Models\ContentPage;
use Illuminate\Support\Collection;

/** Nội dung tĩnh: giới thiệu, hướng dẫn mua hàng, chính sách giao hàng/đổi trả/bảo mật. */
class ContentPageService
{
    public function __construct(private readonly ContentPageRepositoryInterface $pages) {}

    public function listPublic(): Collection
    {
        return $this->pages->all(onlyPublished: true);
    }

    public function listAdmin(): Collection
    {
        return $this->pages->all(onlyPublished: false);
    }

    public function findPublic(string $slug): ContentPage
    {
        $page = $this->pages->findBySlug($slug);

        return $page && $page->is_published ? $page : throw new ResourceNotFoundException('Không tìm thấy trang nội dung.');
    }

    public function findAdmin(string $slug): ContentPage
    {
        return $this->pages->findBySlug($slug) ?? throw new ResourceNotFoundException('Không tìm thấy trang nội dung.');
    }

    public function update(string $slug, array $data): ContentPage
    {
        return $this->pages->update($this->findAdmin($slug), $data);
    }
}
