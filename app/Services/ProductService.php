<?php

namespace App\Services;

use App\Models\Category;
use App\Models\Product;

class ProductService
{
    public function generateSku(int $categoryId): string
    {
        $category = Category::find($categoryId);
        $prefix = $this->deriveCategoryPrefix($category?->name ?? 'PROD');
        $count = Product::withTrashed()->where('category_id', $categoryId)->count() + 1;

        return $prefix . '-' . str_pad($count, 4, '0', STR_PAD_LEFT);
    }

    private function deriveCategoryPrefix(string $name): string
    {
        $name = str_replace(
            ['á', 'é', 'í', 'ó', 'ú', 'Á', 'É', 'Í', 'Ó', 'Ú', 'ñ', 'Ñ', 'ü', 'Ü'],
            ['a', 'e', 'i', 'o', 'u', 'A', 'E', 'I', 'O', 'U', 'n', 'N', 'u', 'U'],
            $name
        );

        $words = preg_split('/\s+/', trim($name));

        if (count($words) > 1) {
            $initials = implode('', array_map(
                fn($w) => strtoupper(substr(preg_replace('/[^a-zA-Z]/', '', $w), 0, 1)),
                $words
            ));

            return substr($initials, 0, 4) ?: 'PROD';
        }

        $clean = strtoupper(preg_replace('/[^a-zA-Z]/', '', $name));

        return substr($clean, 0, 4) ?: 'PROD';
    }
}
