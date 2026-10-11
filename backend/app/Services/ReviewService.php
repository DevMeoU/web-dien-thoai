<?php

namespace App\Services;

use App\Enums\OrderStatus;
use App\Exceptions\BusinessRuleException;
use App\Exceptions\ResourceNotFoundException;
use App\Interfaces\ProductRepositoryInterface;
use App\Interfaces\ReviewRepositoryInterface;
use App\Models\Review;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class ReviewService
{
    public function __construct(
        private readonly ReviewRepositoryInterface $reviews,
        private readonly ProductRepositoryInterface $products,
    ) {}

    public function featured(int $limit = 6): Collection
    {
        return $this->reviews->featured($limit);
    }

    /** @return array{reviews: LengthAwarePaginator, summary: array} */
    public function forProduct(string $productKey, array $filters): array
    {
        $product = $this->products->findActiveByKey($productKey) ?? throw new ResourceNotFoundException('Không tìm thấy sản phẩm.');

        return [
            'reviews' => $this->reviews->paginateForProduct($product->id, $filters),
            'summary' => $this->reviews->summaryForProduct($product->id),
        ];
    }

    public function mine(User $user): Collection
    {
        return $this->reviews->listForUser($user);
    }

    public function eligible(User $user): Collection
    {
        return $this->reviews->eligibleItems($user);
    }

    /** Chỉ khách đã nhận hàng (đơn hoàn tất) mới được đánh giá, mỗi sản phẩm trong đơn một lần. */
    public function create(User $user, array $data): Review
    {
        return DB::transaction(function () use ($user, $data) {
            $item = $this->reviews->findPurchasedItem($user, $data['order_item_id'])
                ?? throw new BusinessRuleException('Bạn chỉ có thể đánh giá sản phẩm đã mua.', 403);
            if ($item->order->status !== OrderStatus::Completed) {
                throw new BusinessRuleException('Bạn chỉ có thể đánh giá sau khi đơn hàng đã hoàn tất.');
            }
            if ($this->reviews->findByOrderItem($item->id)) {
                throw new BusinessRuleException('Sản phẩm trong đơn này đã được đánh giá.', 409);
            }

            $review = $this->reviews->create([
                'user_id' => $user->id,
                'product_id' => $item->product_id,
                'order_item_id' => $item->id,
                'rating' => $data['rating'],
                'comment' => $data['comment'] ?? null,
            ]);
            $this->refreshStats($item->product_id);

            return $review->load('product:id,name,slug,thumbnail');
        });
    }

    public function update(User $user, int $id, array $data): Review
    {
        $review = $this->ownReview($user, $id);
        $this->reviews->update($review, array_intersect_key($data, array_flip(['rating', 'comment'])));
        $this->refreshStats($review->product_id);

        return $review->load('product:id,name,slug,thumbnail');
    }

    public function delete(User $user, int $id): void
    {
        $review = $this->ownReview($user, $id);
        $this->reviews->delete($review);
        $this->refreshStats($review->product_id);
    }

    public function listAdmin(array $filters): LengthAwarePaginator
    {
        return $this->reviews->paginateAdmin($filters);
    }

    /** Ẩn hoặc hiện đánh giá vi phạm; điểm trung bình chỉ tính đánh giá đang công khai. */
    public function setVisibility(int $id, bool $visible): Review
    {
        $review = $this->reviews->findOrFail($id);
        $this->reviews->update($review, ['is_visible' => $visible]);
        $this->refreshStats($review->product_id);

        return $review->load(['user:id,name,email', 'product:id,name,slug']);
    }

    public function reply(int $id, string $reply): Review
    {
        $review = $this->reviews->findOrFail($id);
        $this->reviews->update($review, ['admin_reply' => $reply, 'replied_at' => now()]);

        return $review->load(['user:id,name,email', 'product:id,name,slug']);
    }

    private function ownReview(User $user, int $id): Review
    {
        return $this->reviews->findForUser($user, $id) ?? throw new ResourceNotFoundException('Không tìm thấy đánh giá.');
    }

    private function refreshStats(int $productId): void
    {
        $summary = $this->reviews->summaryForProduct($productId);
        $this->products->updateRating($this->products->findOrFail($productId), $summary['average'], $summary['count']);
    }
}
