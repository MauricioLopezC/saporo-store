<?php

use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->actingAs($this->user);
});

test('index lists all products when no search', function () {
    Product::factory()->count(3)->create();

    $this->get(route('products.index'))
        ->assertOk()
        ->assertInertia(
            fn ($page) => $page
                ->component('products/index')
                ->has('products.data', 3)
                ->has('filters')
        );
});

test('index filters products by name', function () {
    Product::factory()->create(['name' => 'Coca Cola']);
    Product::factory()->create(['name' => 'Pepsi']);

    $this->get(route('products.index', ['search' => 'coca']))
        ->assertOk()
        ->assertInertia(
            fn ($page) => $page
                ->component('products/index')
                ->has('products.data', 1)
                ->where('products.data.0.name', 'Coca Cola')
        );
});

test('index filters products by barcode', function () {
    Product::factory()->create(['barcode' => '7501234567890']);
    Product::factory()->create(['barcode' => '1234567890123']);

    $this->get(route('products.index', ['search' => '7501234']))
        ->assertOk()
        ->assertInertia(
            fn ($page) => $page
                ->component('products/index')
                ->has('products.data', 1)
                ->where('products.data.0.barcode', '7501234567890')
        );
});

test('guests cannot access products index', function () {
    Auth::logout();

    $this->get(route('products.index'))->assertRedirect(route('login'));
});
