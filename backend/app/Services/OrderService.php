<?php

namespace App\Services;

use App\Enums\OrderStatus;
use App\Exceptions\BusinessRuleException;
use App\Exceptions\ResourceNotFoundException;
use App\Interfaces\AddressRepositoryInterface;
use App\Interfaces\CartRepositoryInterface;
use App\Interfaces\OrderRepositoryInterface;
use App\Models\Order;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Nghiệp vụ đặt hàng. Mọi thay đổi tồn kho, mã giảm giá và trạng thái đơn
 * đều chạy trong transaction với các dòng đã khóa để tránh bán vượt tồn hoặc dùng mã quá lượt.
 */
class OrderService
{
    public function __construct(
        private readonly OrderRepositoryInterface $orders,
        private readonly CartRepositoryInterface $carts,
        private readonly AddressRepositoryInterface $addresses,
        private readonly InventoryService $inventory,
        private readonly CouponService $coupons,
        private readonly SettingService $settings,
    ) {}

    /** Tính trước tạm tính, giảm giá, phí giao hàng và tổng tiền cho trang thanh toán. */
    public function preview(User $user, ?string $couponCode): array
    {
        $cart = $this->carts->forUser($user);
        $subtotal = round((float) $cart->items->sum(fn ($item) => $item->line_total), 2);
        $coupon = null;
        $discount = 0.0;
        if ($couponCode) {
            [$coupon, $discount] = $this->coupons->quote($couponCode, $subtotal);
        }

        return [
            ...$this->totals($subtotal, $discount),
            'coupon_code' => $coupon?->code,
            'item_count' => (int) $cart->items->sum('quantity'),
            'issues' => $cart->items->filter(fn ($item) => $item->issue())->map(fn ($item) => [
                'cart_item_id' => $item->id,
                'issue' => $item->issue(),
            ])->values()->all(),
        ];
    }

    public function place(User $user, array $data): Order
    {
        $orderId = DB::transaction(function () use ($user, $data): int {
            $cart = $this->carts->forUser($user);
            if ($cart->items->isEmpty()) {
                throw new BusinessRuleException('Giỏ hàng đang trống.');
            }

            // Khóa các dòng tồn kho để kiểm tra và trừ kho an toàn khi nhiều khách đặt cùng lúc.
            $variants = $this->inventory->lock($cart->items->pluck('product_variant_id')->all());
            [$lines, $quantities, $problems] = $this->buildLines($cart->items, $variants);
            if ($problems !== []) {
                throw new BusinessRuleException('Một số sản phẩm không đủ điều kiện đặt hàng.', 422, ['items' => $problems]);
            }

            $subtotal = round(array_sum(array_column($lines, 'line_total')), 2);
            $coupon = null;
            $discount = 0.0;
            if (! empty($data['coupon_code'])) {
                [$coupon, $discount] = $this->coupons->redeem($data['coupon_code'], $subtotal);
            }

            $order = $this->orders->create([
                'code' => $this->generateCode(),
                'user_id' => $user->id,
                'status' => OrderStatus::Pending,
                'payment_method' => 'cod',
                'payment_status' => Order::PAYMENT_UNPAID,
                ...$this->shippingAddress($user, $data),
                'recipient_email' => $data['email'] ?? $user->email,
                'note' => $data['note'] ?? null,
                ...$this->totals($subtotal, $discount),
                'coupon_id' => $coupon?->id,
                'coupon_code' => $coupon?->code,
            ]);

            $this->orders->createItems($order, $lines);
            $this->inventory->decrease($variants, $quantities);
            $this->orders->addHistory($order, null, OrderStatus::Pending->value, 'Khách đặt hàng.', $user->id);
            $this->carts->clear($cart);

            return $order->id;
        });

        return $this->orders->findDetail($orderId);
    }

    public function listForUser(User $user, array $filters): LengthAwarePaginator
    {
        return $this->orders->paginateForUser($user, $filters);
    }

    public function findForUser(User $user, string $code): Order
    {
        return $this->orders->findByCodeForUser($user, $code) ?? throw new ResourceNotFoundException('Không tìm thấy đơn hàng.');
    }

    public function cancelByCustomer(User $user, string $code, string $reason): Order
    {
        $order = $this->findForUser($user, $code);

        return DB::transaction(function () use ($order, $reason, $user) {
            $locked = $this->orders->lockForUpdate($order->id);
            if (! $locked->isCancellableByCustomer()) {
                throw new BusinessRuleException('Chỉ có thể hủy đơn khi đang chờ xác nhận.');
            }
            $this->transition($locked, OrderStatus::Cancelled, $reason, $user);

            return $this->findForUser($user, $order->code);
        });
    }

    public function listAdmin(array $filters): LengthAwarePaginator
    {
        return $this->orders->paginateAdmin($filters);
    }

    public function detail(int $id): Order
    {
        return $this->orders->findDetail($id) ?? throw new ResourceNotFoundException('Không tìm thấy đơn hàng.');
    }

    public function changeStatus(int $id, OrderStatus $to, ?string $note, User $admin): Order
    {
        DB::transaction(function () use ($id, $to, $note, $admin) {
            $order = $this->orders->lockForUpdate($id) ?? throw new ResourceNotFoundException('Không tìm thấy đơn hàng.');
            $this->transition($order, $to, $note, $admin);
        });

        return $this->detail($id);
    }

    public function updateAdminNote(int $id, ?string $note): Order
    {
        $order = $this->detail($id);
        $this->orders->update($order, ['admin_note' => $note]);

        return $this->detail($id);
    }

    /** Ghi nhận đã thu tiền COD khi đơn đang giao hoặc đã hoàn tất. */
    public function markPaid(int $id, User $admin): Order
    {
        DB::transaction(function () use ($id, $admin) {
            $order = $this->orders->lockForUpdate($id) ?? throw new ResourceNotFoundException('Không tìm thấy đơn hàng.');
            if (! in_array($order->status, [OrderStatus::Shipping, OrderStatus::Completed], true)) {
                throw new BusinessRuleException('Chỉ ghi nhận thu tiền khi đơn đang giao hoặc đã hoàn tất.');
            }
            if ($order->payment_status === Order::PAYMENT_PAID) {
                throw new BusinessRuleException('Đơn hàng này đã được ghi nhận thu tiền.');
            }
            $this->orders->update($order, ['payment_status' => Order::PAYMENT_PAID, 'paid_at' => now()]);
            $this->orders->addHistory($order, $order->status->value, $order->status->value, 'Đã thu tiền COD.', $admin->id);
        });

        return $this->detail($id);
    }

    /** Đổi trạng thái theo đúng quy trình, lưu lịch sử và hoàn tồn khi hủy. Gọi trong transaction với đơn đã khóa. */
    private function transition(Order $order, OrderStatus $to, ?string $note, ?User $actor): void
    {
        $from = $order->status;
        if (! $from->canTransitionTo($to)) {
            throw new BusinessRuleException("Không thể chuyển đơn từ \"{$from->label()}\" sang \"{$to->label()}\".");
        }
        if ($to === OrderStatus::Cancelled && blank($note)) {
            throw new BusinessRuleException('Vui lòng nhập lý do hủy đơn.');
        }

        $changes = ['status' => $to];
        if ($to === OrderStatus::Completed) {
            // Khách đã nhận hàng và trả tiền mặt nên đơn hoàn tất được coi là đã thu tiền.
            $changes += ['completed_at' => now(), 'payment_status' => Order::PAYMENT_PAID, 'paid_at' => $order->paid_at ?? now()];
        }
        if ($to === OrderStatus::Cancelled) {
            $changes += ['cancelled_at' => now(), 'cancel_reason' => $note];
            $this->inventory->restore($order->items()->pluck('quantity', 'product_variant_id')->map(fn ($q) => (int) $q)->all());
            if ($order->coupon_id) {
                $this->coupons->release($order->coupon_id);
            }
        }

        $this->orders->update($order, $changes);
        $this->orders->addHistory($order, $from->value, $to->value, $note, $actor?->id);
    }

    /**
     * Kiểm tra từng dòng giỏ hàng và tạo dữ liệu sao chụp (tên, giá, SKU) để lưu vào đơn.
     *
     * @return array{0: list<array>, 1: array<int, int>, 2: list<string>}
     */
    private function buildLines($items, $variants): array
    {
        $lines = [];
        $quantities = [];
        $problems = [];
        foreach ($items as $item) {
            $variant = $variants[$item->product_variant_id] ?? null;
            if (! $variant || ! $variant->isPurchasable()) {
                $problems[] = ($variant?->product->name ?? 'Một sản phẩm').' hiện không còn được bán.';

                continue;
            }
            if ($variant->stock < $item->quantity) {
                $problems[] = "{$variant->product->name} ({$variant->configuration} / {$variant->color}) chỉ còn {$variant->stock} sản phẩm.";

                continue;
            }
            $price = (float) $variant->effective_price;
            $quantities[$variant->id] = $item->quantity;
            $lines[] = [
                'product_id' => $variant->product_id,
                'product_variant_id' => $variant->id,
                'product_name' => $variant->product->name,
                'sku' => $variant->sku,
                'configuration' => $variant->configuration,
                'color' => $variant->color,
                'image' => $variant->image ?? $variant->product->thumbnail,
                'unit_price' => $price,
                'quantity' => $item->quantity,
                'line_total' => round($price * $item->quantity, 2),
            ];
        }

        return [$lines, $quantities, $problems];
    }

    /** Sao chép địa chỉ giao hàng vào đơn (từ sổ địa chỉ hoặc nhập mới). */
    private function shippingAddress(User $user, array $data): array
    {
        if (! empty($data['address_id'])) {
            $address = $this->addresses->findForUser($user, (int) $data['address_id'])
                ?? throw new BusinessRuleException('Địa chỉ nhận hàng không hợp lệ.');
        } else {
            $address = $data['address'];
            if ($data['save_address'] ?? false) {
                $address = $this->addresses->create([...$address, 'user_id' => $user->id, 'is_default' => $this->addresses->countForUser($user) === 0]);
            }
        }
        $address = is_array($address) ? $address : $address->toArray();

        return [
            'recipient_name' => $address['recipient_name'],
            'recipient_phone' => $address['phone'],
            'shipping_city' => $address['city'],
            'shipping_district' => $address['district'],
            'shipping_ward' => $address['ward'],
            'shipping_line' => $address['line'],
        ];
    }

    private function totals(float $subtotal, float $discount): array
    {
        $shippingFee = $subtotal > 0 ? $this->settings->shippingFee($subtotal) : 0.0;

        return [
            'subtotal' => $subtotal,
            'discount_amount' => $discount,
            'shipping_fee' => $shippingFee,
            'total' => round(max(0, $subtotal - $discount) + $shippingFee, 2),
        ];
    }

    private function generateCode(): string
    {
        do {
            $code = 'MLA'.now()->format('ymd').'-'.strtoupper(Str::random(5));
        } while ($this->orders->codeExists($code));

        return $code;
    }
}
