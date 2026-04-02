<?php

namespace App\Enums;

enum SaleStatus: string
{
    case Pending = 'PENDING';
    case Completed = 'COMPLETED';
    case Cancelled = 'CANCELLED';

    public function label(): string
    {
        return match ($this) {
            self::Pending => 'Pendiente',
            self::Completed => 'Completada',
            self::Cancelled => 'Cancelada',
        };
    }
}
