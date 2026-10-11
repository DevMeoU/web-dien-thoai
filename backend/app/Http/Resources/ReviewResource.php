<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReviewResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $isAdmin = (bool) $request->user()?->isAdmin();

        return [
            'id' => $this->id,
            'rating' => $this->rating,
            'comment' => $this->comment,
            'is_visible' => $this->when($isAdmin || $request->user()?->id === $this->user_id, $this->is_visible),
            'admin_reply' => $this->admin_reply,
            'replied_at' => $this->replied_at?->toIso8601String(),
            'user' => $this->whenLoaded('user', fn () => [
                'id' => $this->user->id,
                'name' => $this->user->name,
                'email' => $this->when($isAdmin, $this->user->email),
            ]),
            'product' => $this->whenLoaded('product', fn () => [
                'id' => $this->product->id,
                'name' => $this->product->name,
                'slug' => $this->product->slug,
                'thumbnail_url' => $this->product->thumbnail_url,
            ]),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
