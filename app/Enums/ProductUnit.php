<?php

namespace App\Enums;

enum ProductUnit: string
{
    case Unidad = 'unidad';
    case Kilogramo = 'kg';
    case Gramo = 'g';
    case Metro = 'm';
    case MetroCuadrado = 'm2';
    case Litro = 'l';
    case Mililitro = 'ml';
    case Caja = 'caja';
    case Docena = 'docena';
    case Par = 'par';

    public function label(): string
    {
        return match ($this) {
            self::Unidad => 'Unidad',
            self::Kilogramo => 'Kilogramo (kg)',
            self::Gramo => 'Gramo (g)',
            self::Metro => 'Metro (m)',
            self::MetroCuadrado => 'Metro cuadrado (m²)',
            self::Litro => 'Litro (l)',
            self::Mililitro => 'Mililitro (ml)',
            self::Caja => 'Caja',
            self::Docena => 'Docena',
            self::Par => 'Par',
        };
    }

    public function isInteger(): bool
    {
        return in_array($this, [self::Unidad, self::Caja, self::Docena, self::Par]);
    }
}
