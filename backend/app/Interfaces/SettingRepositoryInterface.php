<?php

namespace App\Interfaces;

interface SettingRepositoryInterface
{
    /** @return array<string, string|null> */
    public function all(): array;

    public function setMany(array $values): void;
}
