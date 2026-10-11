<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ContentPageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'slug' => $this->slug,
            'title' => $this->title,
            'content' => $this->content,
            'is_published' => $this->when((bool) $request->user()?->isAdmin(), $this->is_published),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
