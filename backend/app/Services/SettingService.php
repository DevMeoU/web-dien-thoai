<?php

namespace App\Services;

use App\Interfaces\SettingRepositoryInterface;

/** Cấu hình cửa hàng: thông tin liên hệ, giới thiệu, phí giao hàng và ngưỡng cảnh báo tồn kho. */
class SettingService
{
    public const DEFAULTS = [
        'store_name' => 'Mela',
        'contact_email' => 'support@mela.vn',
        'contact_phone' => '',
        'contact_address' => '',
        'about_content' => '',
        'shipping_fee' => '30000',
        'free_shipping_threshold' => '1000000',
        'low_stock_threshold' => '5',
    ];

    /** Các khóa được phép trả về cho khách (không lộ cấu hình nội bộ). */
    public const PUBLIC_KEYS = [
        'store_name', 'contact_email', 'contact_phone', 'contact_address', 'about_content',
        'shipping_fee', 'free_shipping_threshold',
    ];

    public function __construct(private readonly SettingRepositoryInterface $settings) {}

    public function all(): array
    {
        return array_merge(self::DEFAULTS, array_filter($this->settings->all(), fn ($value) => $value !== null));
    }

    public function publicSettings(): array
    {
        return array_intersect_key($this->all(), array_flip(self::PUBLIC_KEYS));
    }

    public function update(array $values): array
    {
        $this->settings->setMany(array_intersect_key($values, self::DEFAULTS));

        return $this->all();
    }

    /** Phí giao hàng cố định; miễn phí khi tạm tính đạt ngưỡng (ngưỡng 0 = không miễn phí). */
    public function shippingFee(float $subtotal): float
    {
        $all = $this->all();
        $threshold = (float) $all['free_shipping_threshold'];

        return $threshold > 0 && $subtotal >= $threshold ? 0.0 : (float) $all['shipping_fee'];
    }

    public function lowStockThreshold(): int
    {
        return (int) $this->all()['low_stock_threshold'];
    }
}
