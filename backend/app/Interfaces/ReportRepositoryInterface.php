<?php

namespace App\Interfaces;

use Carbon\CarbonInterface;
use Illuminate\Support\Collection;
use Illuminate\Support\LazyCollection;

interface ReportRepositoryInterface
{
    public function customersCount(): int;

    public function productsCount(): int;

    public function pendingOrdersCount(): int;

    public function ordersCount(CarbonInterface $from, CarbonInterface $to): int;

    /** Doanh thu của đơn hoàn tất, tính theo ngày hoàn tất. */
    public function revenue(CarbonInterface $from, CarbonInterface $to): float;

    /** @return Collection<int, array{date: string, orders: int, revenue: float}> */
    public function dailySeries(CarbonInterface $from, CarbonInterface $to): Collection;

    /** @return array<string, int> */
    public function ordersByStatus(CarbonInterface $from, CarbonInterface $to): array;

    public function topProducts(CarbonInterface $from, CarbonInterface $to, int $limit): Collection;

    public function topCustomers(CarbonInterface $from, CarbonInterface $to, int $limit): Collection;

    /** @return array{total_units: int, low_stock: int, out_of_stock: int} */
    public function inventorySummary(int $threshold): array;

    public function recentOrders(int $limit): Collection;

    public function ordersForExport(CarbonInterface $from, CarbonInterface $to): LazyCollection;
}
