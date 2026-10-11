<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** Không bao giờ trả về mật khẩu hay token. */
class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'avatar_url' => $this->avatar_url,
            'role' => $this->role,
            'is_active' => (bool) $this->is_active,
            'orders_count' => $this->whenCounted('orders'),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
