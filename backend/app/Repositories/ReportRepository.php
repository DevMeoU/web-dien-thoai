<?php

namespace App\Repositories;

use App\Enums\OrderStatus;
use App\Interfaces\ReportRepositoryInterface;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use Carbon\CarbonInterface;
use Illuminate\Support\Collection;
use Illuminate\Support\LazyCollection;

class ReportRepository implements ReportRepositoryInterface
{
    public function customersCount(): int
    {
        return User::query()->where('role', User::ROLE_USER)->count();
    }

    public function productsCount(): int
    {
        return Product::query()->count();
    }

    public function pendingOrdersCount(): int
    {
        return Order::query()->where('status', OrderStatus::Pending->value)->count();
    }

    public function ordersCount(CarbonInterface $from, CarbonInterface $to): int
    {
        return Order::query()->whereBetween('created_at', [$from, $to])->count();
    }

    public function revenue(CarbonInterface $from, CarbonInterface $to): float
    {
        return (float) Order::query()->where('status', OrderStatus::Completed->value)
            ->whereBetween('completed_at', [$from, $to])->sum('total');
    }

    public function dailySeries(CarbonInterface $from, CarbonInterface $to): Collection
    {
        $orders = Order::query()->whereBetween('created_at', [$from, $to])
            ->selectRaw('DATE(created_at) as day, COUNT(*) as total')->groupBy('day')->pluck('total', 'day');
        $revenue = Order::query()->where('status', OrderStatus::Completed->value)->whereBetween('completed_at', [$from, $to])
            ->selectRaw('DATE(completed_at) as day, SUM(total) as total')->groupBy('day')->pluck('total', 'day');

        $series = collect();
        for ($day = $from->copy()->startOfDay(); $day->lte($to); $day->addDay()) {
            $key = $day->toDateString();
            $series->push(['date' => $key, 'orders' => (int) ($orders[$key] ?? 0), 'revenue' => (float) ($revenue[$key] ?? 0)]);
        }

        return $series;
    }

    public function ordersByStatus(CarbonInterface $from, CarbonInterface $to): array
    {
        $counts = Order::query()->whereBetween('created_at', [$from, $to])
            ->selectRaw('status, COUNT(*) as total')->groupBy('status')->pluck('total', 'status');

        return collect(OrderStatus::cases())->mapWithKeys(fn (OrderStatus $s) => [$s->value => (int) ($counts[$s->value] ?? 0)])->all();
    }

    public function topProducts(CarbonInterface $from, CarbonInterface $to, int $limit): Collection
    {
        // "Đã bán" chỉ tính các đơn đã hoàn tất trong khoảng ngày.
        return OrderItem::query()
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->where('orders.status', OrderStatus::Completed->value)
            ->whereBetween('orders.completed_at', [$from, $to])
            ->groupBy('order_items.product_id', 'order_items.product_name')
            ->selectRaw('order_items.product_id, order_items.product_name, SUM(order_items.quantity) as quantity_sold, SUM(order_items.line_total) as revenue')
            ->orderByDesc('quantity_sold')->limit($limit)->get();
    }

    public function topCustomers(CarbonInterface $from, CarbonInterface $to, int $limit): Collection
    {
        return Order::query()->join('users', 'users.id', '=', 'orders.user_id')
            ->where('orders.status', OrderStatus::Completed->value)
            ->whereBetween('orders.completed_at', [$from, $to])
            ->groupBy('users.id', 'users.name', 'users.email')
            ->selectRaw('users.id as user_id, users.name, users.email, COUNT(orders.id) as orders_count, SUM(orders.total) as total_spent')
            ->orderByDesc('total_spent')->limit($limit)->get();
    }

    public function inventorySummary(int $threshold): array
    {
        $active = ProductVariant::query()->where('is_active', true);

        return [
            'total_units' => (int) (clone $active)->sum('stock'),
            'low_stock' => (clone $active)->where('stock', '>', 0)->where('stock', '<=', $threshold)->count(),
            'out_of_stock' => (clone $active)->where('stock', 0)->count(),
        ];
    }

    public function recentOrders(int $limit): Collection
    {
        return Order::query()->with('user:id,name,email')->latest('id')->limit($limit)->get();
    }

    public function ordersForExport(CarbonInterface $from, CarbonInterface $to): LazyCollection
    {
        return Order::query()->with('user:id,name,email')->whereBetween('created_at', [$from, $to])->orderBy('id')->lazy(200);
    }
}
