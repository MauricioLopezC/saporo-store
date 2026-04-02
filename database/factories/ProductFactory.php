<?php

namespace Database\Factories;

use App\Enums\ProductUnit;
use App\Models\Category;
use App\Models\Product;
use App\Models\Supplier;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Product>
 */
class ProductFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'sku' => fake()->unique()->bothify('SKU-####??'),
            'barcode' => fake()->optional()->ean13(),
            'name' => fake()->words(3, true),
            'description' => fake()->optional()->sentence(),
            'price' => fake()->randomFloat(2, 1, 10000),
            'cost' => fake()->optional()->randomFloat(2, 1, 5000),
            'unit' => fake()->randomElement(ProductUnit::cases())->value,
            'category_id' => Category::factory(),
            'supplier_id' => fake()->optional() ? Supplier::factory() : null,
            'is_active' => true,
        ];
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }
}
