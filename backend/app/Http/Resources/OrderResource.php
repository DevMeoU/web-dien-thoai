<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'code' => $this->code,
            'status' => $this->status->value,
            'status_label' => $this->status->label(),
            'payment_method' => $this->payment_method,
            'payment_status' => $this->payment_status,
            'paid_at' => $this->paid_at?->toIso8601String(),
            'recipient' => ['name' => $this->recipient_name, 'phone' => $this->recipient_phone, 'email' => $this->recipient_email],
            'shipping_address' => [
                'city' => $this->shipping_city,
                'district' => $this->shipping_district,
                'ward' => $this->shipping_ward,
                'line' => $this->shipping_line,
            ],
            'note' => $this->note,
            'subtotal' => $this->subtotal,
            'discount_amount' => $this->discount_amount,
            'shipping_fee' => $this->shipping_fee,
            'total' => $this->total,
            'coupon_code' => $this->coupon_code,
            'cancel_reason' => $this->cancel_reason,
            'can_cancel' => $this->isCancellableByCustomer(),
            'items_count' => $this->whenLoaded('items', fn () => (int) $this->items->sum('quantity')),
            'items' => $this->whenLoaded('items', fn () => $this->items->map(fn ($item) => [
                'id' => $item->id,
                'product_id' => $item->product_id,
                'product_name' => $item->product_name,
                'sku' => $item->sku,
                'configuration' => $item->configuration,
                'color' => $item->color,
                'image_url' => $item->image_url,
                'unit_price' => $item->unit_price,
                'quantity' => $item->quantity,
                'line_total' => $item->line_total,
                'review_id' => $item->relationLoaded('review') ? $item->review?->id : null,
            ])->values()),
            'histories' => $this->whenLoaded('histories', fn () => $this->histories->map(fn ($history) => [
                'from_status' => $history->from_status,
                'to_status' => $history->to_status,
                'note' => $history->note,
                'changed_by' => $history->relationLoaded('actor') ? $history->actor?->name : null,
                'created_at' => $history->created_at?->toIso8601String(),
            ])->values()),
            // Chỉ quản trị mới thấy khách hàng và ghi chú nội bộ.
            'customer' => $this->when($request->user()?->isAdmin() && $this->relationLoaded('user'), fn () => new UserResource($this->user)),
            'admin_note' => $this->when($request->user()?->isAdmin(), $this->admin_note),
            'created_at' => $this->created_at?->toIso8601String(),
            'completed_at' => $this->completed_at?->toIso8601String(),
            'cancelled_at' => $this->cancelled_at?->toIso8601String(),
        ];
    }
}
