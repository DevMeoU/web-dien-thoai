<?php

namespace App\Services;

use App\Interfaces\ReportRepositoryInterface;
use Carbon\Carbon;
use Carbon\CarbonInterface;

class DashboardService
{
    public function __construct(
        private readonly ReportRepositoryInterface $reports,
        private readonly InventoryService $inventory,
    ) {}

    /** Khoảng ngày mặc định là 30 ngày gần nhất. @return array{0: CarbonInterface, 1: CarbonInterface} */
    public static function range(?string $from, ?string $to): array
    {
        $end = $to ? Carbon::parse($to)->endOfDay() : now()->endOfDay();
        $start = $from ? Carbon::parse($from)->startOfDay() : $end->copy()->subDays(29)->startOfDay();

        return [$start, $end];
    }

    public function overview(?string $from, ?string $to): array
    {
        [$start, $end] = self::range($from, $to);

        return [
            'range' => ['from' => $start->toDateString(), 'to' => $end->toDateString()],
            'customers_count' => $this->reports->customersCount(),
            'products_count' => $this->reports->productsCount(),
            'new_orders_count' => $this->reports->ordersCount($start, $end),
            'pending_orders_count' => $this->reports->pendingOrdersCount(),
            'revenue' => $this->reports->revenue($start, $end),
            'chart' => $this->reports->dailySeries($start, $end)->all(),
            'recent_orders' => $this->reports->recentOrders(5),
            'low_stock' => $this->inventory->lowStock(8),
        ];
    }
}
