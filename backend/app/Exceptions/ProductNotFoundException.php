<?php

namespace App\Exceptions;

class ProductNotFoundException extends ResourceNotFoundException
{
    public function __construct()
    {
        parent::__construct('Không tìm thấy sản phẩm.');
    }
}
