<?php

namespace App\Services;

use App\Exceptions\ResourceNotFoundException;
use App\Helpers\Slug;
use App\Interfaces\PostRepositoryInterface;
use App\Models\Post;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\UploadedFile;

class PostService extends CrudService
{
    public function __construct(private readonly PostRepositoryInterface $posts, private readonly ImageService $images)
    {
        parent::__construct($posts);
    }

    public function listPublished(array $filters): LengthAwarePaginator
    {
        return $this->posts->paginatePublished($filters);
    }

    public function findPublished(string $slug): Post
    {
        return $this->posts->findPublishedBySlug($slug) ?? throw new ResourceNotFoundException;
    }

    protected function prepare(array $data, ?Model $current = null): array
    {
        if (! empty($data['slug']) || (! $current && ! empty($data['title']))) {
            $data['slug'] = Slug::unique(Post::class, $data['slug'] ?? $data['title'], $current?->id);
        }
        // Bài xuất bản mà chưa đặt ngày đăng thì lấy thời điểm hiện tại.
        $publishing = $data['is_published'] ?? $current?->is_published ?? true;
        if ($publishing && empty($data['published_at']) && empty($current?->published_at)) {
            $data['published_at'] = now();
        }

        return $data;
    }

    public function uploadImage(int $id, UploadedFile $file): Model
    {
        $post = $this->posts->findOrFail($id);

        return $this->posts->update($post, ['image' => $this->images->replace($post->image, $file, 'posts')]);
    }

    protected function guardDelete(Model $model): void
    {
        $this->images->delete($model->image);
    }
}
