<?php

namespace App\Enums;

enum StockMovementType: string
{
    case In = 'IN';
    case Out = 'OUT';
    case Adjustment = 'ADJUSTMENT';

    public function label(): string
    {
        return match ($this) {
            self::In => 'Entrada',
            self::Out => 'Salida',
            self::Adjustment => 'Ajuste',
        };
    }
}
