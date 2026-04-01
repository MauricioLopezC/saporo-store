<?php

namespace App\Enums;

enum StockMovementType: string
{
    case In = 'IN';
    case Out = 'OUT';
    case Adjustment = 'ADJUSTMENT';
}
