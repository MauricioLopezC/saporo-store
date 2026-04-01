<?php

namespace Database\Factories;

use App\Enums\StockMovementType;
use App\Models\Branch;
use App\Models\Product;
use App\Models\StockMovement;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<StockMovement>
 */
class StockMovementFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $previousStock = fake()->numberBetween(0, 500);
        $quantity = fake()->numberBetween(1, 50);
        $type = fake()->randomElement(StockMovementType::cases());
        $currentStock = $type === StockMovementType::Out
            ? max(0, $previousStock - $quantity)
            : $previousStock + $quantity;

        return [
            'product_id' => Product::factory(),
            'branch_id' => Branch::factory(),
            'user_id' => User::factory(),
            'type' => $type,
            'quantity' => $quantity,
            'previous_stock' => $previousStock,
            'current_stock' => $currentStock,
            'reason' => fake()->optional()->sentence(),
            'reference_id' => null,
        ];
    }
}
