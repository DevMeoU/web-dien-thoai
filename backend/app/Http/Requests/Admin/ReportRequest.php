<?php

namespace App\Http\Requests\Admin;

use App\Http\Requests\ApiRequest;
use App\Services\ReportService;
use Illuminate\Validation\Rule;

class ReportRequest extends ApiRequest
{
    public function rules(): array
    {
        return [
            'from' => ['sometimes', 'nullable', 'date'],
            'to' => ['sometimes', 'nullable', 'date', 'after_or_equal:from'],
            'type' => ['sometimes', Rule::in(ReportService::EXPORT_TYPES)],
        ];
    }
}
