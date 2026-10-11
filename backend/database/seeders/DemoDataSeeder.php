<?php

namespace Database\Seeders;

use App\Enums\OrderStatus;
use App\Models\ContactRequest;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Review;
use App\Models\User;
use App\Services\SettingService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

/** Đơn hàng, đánh giá và yêu cầu liên hệ mẫu rải trong 30 ngày để dashboard và báo cáo có số liệu. */
class DemoDataSeeder extends Seeder
{
    public function run(SettingService $settings): void
    {
        if (Order::query()->exists()) {
            return;
        }
        mt_srand(2026);
        $customers = User::query()->where('role', User::ROLE_USER)->get();
        $variants = ProductVariant::query()->with('product')->where('is_active', true)->get();
        $statuses = [
            ...array_fill(0, 11, OrderStatus::Completed), ...array_fill(0, 3, OrderStatus::Pending),
            ...array_fill(0, 2, OrderStatus::Confirmed), ...array_fill(0, 2, OrderStatus::Shipping), ...array_fill(0, 2, OrderStatus::Cancelled),
        ];

        foreach (range(1, 28) as $index) {
            $customer = $customers->random();
            $createdAt = now()->subDays(mt_rand(0, 29))->setTime(mt_rand(8, 21), mt_rand(0, 59));
            $status = $statuses[array_rand($statuses)];
            $lines = $variants->random(mt_rand(1, 3))->map(fn (ProductVariant $variant) => [
                'variant' => $variant, 'quantity' => mt_rand(1, 2),
            ]);
            $subtotal = $lines->sum(fn ($line) => (float) $line['variant']->effective_price * $line['quantity']);
            $shipping = $settings->shippingFee($subtotal);

            $order = new Order([
                'code' => 'MLA'.$createdAt->format('ymd').'-'.strtoupper(Str::random(5)),
                'user_id' => $customer->id, 'status' => $status, 'payment_method' => 'cod',
                'payment_status' => $status === OrderStatus::Completed ? Order::PAYMENT_PAID : Order::PAYMENT_UNPAID,
                'recipient_name' => $customer->name, 'recipient_phone' => $customer->phone, 'recipient_email' => $customer->email,
                'shipping_city' => 'TP. Hồ Chí Minh', 'shipping_district' => 'Quận '.mt_rand(1, 12), 'shipping_ward' => 'Phường '.mt_rand(1, 15),
                'shipping_line' => mt_rand(1, 200).' Nguyễn Trãi',
                'subtotal' => $subtotal, 'discount_amount' => 0, 'shipping_fee' => $shipping, 'total' => $subtotal + $shipping,
                'completed_at' => $status === OrderStatus::Completed ? $createdAt->copy()->addDays(3) : null,
                'paid_at' => $status === OrderStatus::Completed ? $createdAt->copy()->addDays(3) : null,
                'cancelled_at' => $status === OrderStatus::Cancelled ? $createdAt->copy()->addHour() : null,
                'cancel_reason' => $status === OrderStatus::Cancelled ? 'Khách đổi ý' : null,
            ]);
            $order->created_at = $createdAt;
            $order->updated_at = $createdAt;
            $order->save();

            foreach ($lines as $line) {
                $variant = $line['variant'];
                $price = (float) $variant->effective_price;
                $order->items()->create([
                    'product_id' => $variant->product_id, 'product_variant_id' => $variant->id, 'product_name' => $variant->product->name,
                    'sku' => $variant->sku, 'configuration' => $variant->configuration, 'color' => $variant->color, 'image' => $variant->product->thumbnail,
                    'unit_price' => $price, 'quantity' => $line['quantity'], 'line_total' => $price * $line['quantity'],
                ]);
            }

            $this->history($order, $status, $createdAt);
        }

        $this->reviews();
        $this->contactRequests();
    }

    private function history(Order $order, OrderStatus $final, $createdAt): void
    {
        $path = match ($final) {
            OrderStatus::Pending => [OrderStatus::Pending],
            OrderStatus::Confirmed => [OrderStatus::Pending, OrderStatus::Confirmed],
            OrderStatus::Shipping => [OrderStatus::Pending, OrderStatus::Confirmed, OrderStatus::Shipping],
            OrderStatus::Completed => [OrderStatus::Pending, OrderStatus::Confirmed, OrderStatus::Shipping, OrderStatus::Completed],
            OrderStatus::Cancelled => [OrderStatus::Pending, OrderStatus::Cancelled],
        };
        $previous = null;
        foreach ($path as $step => $status) {
            $history = $order->histories()->make([
                'from_status' => $previous?->value, 'to_status' => $status->value,
                'note' => $status === OrderStatus::Cancelled ? 'Khách đổi ý' : null,
            ]);
            $history->created_at = $createdAt->copy()->addHours($step * 6);
            $history->save();
            $previous = $status;
        }
    }

    private function reviews(): void
    {
        $comments = [5 => ['Máy chính hãng, nguyên seal, dùng rất mượt.', 'Màn hình đẹp, pin trâu hơn mong đợi.', 'Giao nhanh, đóng gói cẩn thận.'], 4 => ['Hài lòng, chỉ mong giá mềm hơn một chút.', 'Máy đẹp, màu ngoài đời hơi khác ảnh một chút.'], 3 => ['Tạm ổn so với giá, hộp hơi móp khi nhận.']];
        $orders = Order::query()->with('items')->where('status', OrderStatus::Completed->value)->get();
        foreach ($orders as $order) {
            foreach ($order->items as $item) {
                if (mt_rand(1, 100) > 65) {
                    continue;
                }
                $rating = [5, 5, 5, 4, 4, 3][mt_rand(0, 5)];
                Review::query()->create([
                    'user_id' => $order->user_id, 'product_id' => $item->product_id, 'order_item_id' => $item->id,
                    'rating' => $rating, 'comment' => $comments[$rating][array_rand($comments[$rating])],
                ]);
            }
        }

        Product::query()->each(function (Product $product): void {
            $query = Review::query()->where('product_id', $product->id)->where('is_visible', true);
            $product->forceFill(['rating_avg' => round((float) $query->avg('rating'), 2), 'rating_count' => $query->count()])->save();
        });
    }

    private function contactRequests(): void
    {
        ContactRequest::factory()->create(['name' => 'Nguyễn Lan Anh', 'message' => 'Tôi muốn đổi iPhone sang phiên bản 512GB, mã đơn của tôi vừa đặt hôm qua.', 'status' => 'new']);
        ContactRequest::factory()->create(['name' => 'Trần Minh Khoa', 'message' => 'Cửa hàng có giao hàng ra Hà Nội không và mất bao lâu?', 'status' => 'processing', 'admin_note' => 'Đã gọi lại, chờ khách phản hồi.']);
        ContactRequest::factory()->create(['name' => 'Lê Thu Hà', 'message' => 'Cảm ơn shop, tôi đã nhận được MacBook và đã kích hoạt bảo hành.', 'status' => 'resolved', 'admin_note' => 'Đã phản hồi cảm ơn.']);
    }
}
