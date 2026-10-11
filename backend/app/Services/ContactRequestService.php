<?php

namespace App\Services;

use App\Interfaces\ContactRequestRepositoryInterface;
use App\Models\ContactRequest;

class ContactRequestService extends CrudService
{
    public function __construct(ContactRequestRepositoryInterface $requests)
    {
        parent::__construct($requests);
    }

    /** Khách gửi yêu cầu hỗ trợ; luôn bắt đầu ở trạng thái "mới". */
    public function submit(array $data): ContactRequest
    {
        return $this->create([...$data, 'status' => ContactRequest::STATUS_NEW]);
    }
}
