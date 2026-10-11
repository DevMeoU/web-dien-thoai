<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ContactRequest extends Model
{
    use HasFactory;

    public const STATUS_NEW = 'new';

    public const STATUS_PROCESSING = 'processing';

    public const STATUS_RESOLVED = 'resolved';

    public const STATUSES = [self::STATUS_NEW, self::STATUS_PROCESSING, self::STATUS_RESOLVED];

    protected $fillable = ['name', 'email', 'phone', 'message', 'order_code', 'status', 'admin_note'];
}
