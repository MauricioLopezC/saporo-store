<?php

namespace App\Enums;

enum SaleStatus: string
{
    case Pending = 'PENDING';
    case Completed = 'COMPLETED';
    case Cancelled = 'CANCELLED';
}
