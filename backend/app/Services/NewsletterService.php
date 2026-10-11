<?php

namespace App\Services;

use App\Interfaces\NewsletterRepositoryInterface;
use Illuminate\Database\Eloquent\Model;

class NewsletterService extends CrudService
{
    public function __construct(private readonly NewsletterRepositoryInterface $subscribers)
    {
        parent::__construct($subscribers);
    }

    /** Đăng ký nhận tin; email đã đăng ký thì giữ nguyên (hoặc bật lại nếu từng bị tắt), không báo lỗi trùng. */
    public function subscribe(string $email): Model
    {
        $email = mb_strtolower(trim($email));
        $existing = $this->subscribers->findByEmail($email);
        if ($existing) {
            return $existing->is_active ? $existing : $this->subscribers->update($existing, ['is_active' => true]);
        }

        return $this->subscribers->create(['email' => $email, 'is_active' => true]);
    }
}
