<?php

namespace App\Exceptions;

class ResourceNotFoundException extends ApiException
{
    public function __construct(string $message = 'Không tìm thấy dữ liệu.')
    {
        parent::__construct($message, 404);
    }
}
