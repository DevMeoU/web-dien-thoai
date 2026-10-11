<?php

namespace App\Http\Controllers\API\Admin;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ReportRequest;
use App\Services\ReportService;
use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportController extends Controller
{
    public function __construct(private readonly ReportService $reports) {}

    public function summary(ReportRequest $request): JsonResponse
    {
        return ApiResponse::success($this->reports->summary($request->validated('from'), $request->validated('to')));
    }

    /** Xuất dữ liệu tổng hợp ra CSV (có BOM để Excel đọc đúng tiếng Việt). */
    public function export(ReportRequest $request): StreamedResponse
    {
        $export = $this->reports->export($request->validated('type', 'orders'), $request->validated('from'), $request->validated('to'));

        return response()->streamDownload(function () use ($export): void {
            $out = fopen('php://output', 'w');
            fwrite($out, "\xEF\xBB\xBF");
            fputcsv($out, $export['headers']);
            foreach ($export['rows'] as $row) {
                fputcsv($out, $row);
            }
            fclose($out);
        }, $export['filename'], ['Content-Type' => 'text/csv; charset=UTF-8']);
    }
}
