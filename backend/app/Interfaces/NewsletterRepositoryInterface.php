<?php

namespace App\Interfaces;

use App\Models\NewsletterSubscriber;

interface NewsletterRepositoryInterface extends RepositoryInterface
{
    public function findByEmail(string $email): ?NewsletterSubscriber;
}
