<?php

namespace Database\Factories;

use App\Enums\SaleStatus;
use App\Models\Branch;
use App\Models\Customer;
use App\Models\Sale;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Sale>
 */
class SaleFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $subtotal = fake()->randomFloat(2, 10, 5000);
        $discount = fake()->randomFloat(2, 0, $subtotal * 0.1);
        $tax = fake()->randomFloat(2, 0, $subtotal * 0.16);
        $total = $subtotal - $discount + $tax;

        return [
            'sale_number' => 'VTA-'.fake()->unique()->numerify('####'),
            'branch_id' => Branch::factory(),
            'customer_id' => fake()->optional() ? Customer::factory() : null,
            'user_id' => User::factory(),
            'status' => SaleStatus::Completed,
            'subtotal' => $subtotal,
            'discount' => $discount,
            'tax' => $tax,
            'total' => $total,
            'notes' => fake()->optional()->sentence(),
        ];
    }

    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => SaleStatus::Pending,
        ]);
    }

    public function cancelled(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => SaleStatus::Cancelled,
        ]);
    }
}
