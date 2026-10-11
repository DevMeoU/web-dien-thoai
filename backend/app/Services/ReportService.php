<?php

namespace App\Services;

use App\Exceptions\BusinessRuleException;
use App\Interfaces\ReportRepositoryInterface;
use Illuminate\Support\LazyCollection;

class ReportService
{
    public const EXPORT_TYPES = ['orders', 'products', 'customers', 'revenue'];

    public function __construct(
        private readonly ReportRepositoryInterface $reports,
        private readonly SettingService $settings,
    ) {}

    public function summary(?string $from, ?string $to): array
    {
        [$start, $end] = DashboardService::range($from, $to);

        return [
            'range' => ['from' => $start->toDateString(), 'to' => $end->toDateString()],
            'revenue' => $this->reports->revenue($start, $end),
            'orders_by_status' => $this->reports->ordersByStatus($start, $end),
            'daily' => $this->reports->dailySeries($start, $end)->all(),
            'top_products' => $this->reports->topProducts($start, $end, 10),
            'top_customers' => $this->reports->topCustomers($start, $end, 10),
            'inventory' => $this->reports->inventorySummary($this->settings->lowStockThreshold()),
        ];
    }

    /**
     * Chuẩn bị dữ liệu CSV tổng hợp.
     *
     * @return array{filename: string, headers: list<string>, rows: LazyCollection<int, list<mixed>>}
     */
    public function export(string $type, ?string $from, ?string $to): array
    {
        [$start, $end] = DashboardService::range($from, $to);
        $suffix = $start->format('Ymd').'-'.$end->format('Ymd');

        return match ($type) {
            'orders' => [
                'filename' => "don-hang-{$suffix}.csv",
                'headers' => ['Mã đơn', 'Khách hàng', 'Email', 'Trạng thái', 'Thanh toán', 'Tạm tính', 'Giảm giá', 'Phí giao hàng', 'Tổng tiền', 'Ngày đặt'],
                'rows' => $this->reports->ordersForExport($start, $end)->map(fn ($o) => [
                    $o->code, $o->user?->name, $o->user?->email, $o->status->label(), $o->payment_status,
                    $o->subtotal, $o->discount_amount, $o->shipping_fee, $o->total, $o->created_at->format('Y-m-d H:i'),
                ]),
            ],
            'products' => [
                'filename' => "san-pham-ban-chay-{$suffix}.csv",
                'headers' => ['Mã sản phẩm', 'Tên sản phẩm', 'Số lượng đã bán', 'Doanh thu'],
                'rows' => LazyCollection::make($this->reports->topProducts($start, $end, 1000)->map(fn ($p) => [
                    $p->product_id, $p->product_name, $p->quantity_sold, $p->revenue,
                ])->all()),
            ],
            'customers' => [
                'filename' => "khach-mua-nhieu-{$suffix}.csv",
                'headers' => ['Mã khách', 'Họ tên', 'Email', 'Số đơn hoàn tất', 'Tổng chi tiêu'],
                'rows' => LazyCollection::make($this->reports->topCustomers($start, $end, 1000)->map(fn ($c) => [
                    $c->user_id, $c->name, $c->email, $c->orders_count, $c->total_spent,
                ])->all()),
            ],
            'revenue' => [
                'filename' => "doanh-thu-{$suffix}.csv",
                'headers' => ['Ngày', 'Số đơn mới', 'Doanh thu đơn hoàn tất'],
                'rows' => LazyCollection::make($this->reports->dailySeries($start, $end)->map(fn ($d) => [
                    $d['date'], $d['orders'], $d['revenue'],
                ])->all()),
            ],
            default => throw new BusinessRuleException('Loại báo cáo không được hỗ trợ.'),
        };
    }
}
