<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AddressResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'recipient_name' => $this->recipient_name,
            'phone' => $this->phone,
            'city' => $this->city,
            'district' => $this->district,
            'ward' => $this->ward,
            'line' => $this->line,
            'full_address' => "{$this->line}, {$this->ward}, {$this->district}, {$this->city}",
            'is_default' => $this->is_default,
        ];
    }
}
