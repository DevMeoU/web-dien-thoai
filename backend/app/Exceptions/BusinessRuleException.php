<?php

namespace App\Exceptions;

/** Thao tác hợp lệ về cú pháp nhưng vi phạm quy tắc nghiệp vụ (hết hàng, mã hết hạn, sai trạng thái...). */
class BusinessRuleException extends ApiException
{
    public function __construct(string $message, int $status = 422, array $errors = [])
    {
        parent::__construct($message, $status, $errors);
    }
}
