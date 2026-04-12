<?php

use App\Models\Branch;
use App\Models\Product;
use App\Models\ProductStock;
use App\Models\User;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->actingAs($this->user);
});

test('index lists product stock', function () {
    ProductStock::factory()->count(3)->create();

    $this->get(route('product-stock.index'))
        ->assertOk()
        ->assertInertia(
            fn($page) => $page
                ->component('product-stock/index')
                ->has('stocks.data', 3)
                ->has('branches')
        );
});

test('guests cannot access product stock', function () {
    auth()->logout();

    $this->get(route('product-stock.index'))->assertRedirect(route('login'));
});

test('index filters by branch', function () {
    $branch = Branch::factory()->create();
    ProductStock::factory()->count(2)->create(['branch_id' => $branch->id]);
    ProductStock::factory()->count(3)->create();

    $this->get(route('product-stock.index', ['branch_id' => $branch->id]))
        ->assertOk()
        ->assertInertia(
            fn($page) => $page
                ->has('stocks.data', 2)
        );
});

test('create page renders with products and branches', function () {
    $this->get(route('product-stock.create'))
        ->assertOk()
        ->assertInertia(
            fn($page) => $page
                ->component('product-stock/create')
                ->has('products')
                ->has('branches')
        );
});

test('store creates a product stock record', function () {
    $product = Product::factory()->create();
    $branch = Branch::factory()->create();

    $this->post(route('product-stock.store'), [
        'product_id' => $product->id,
        'branch_id' => $branch->id,
        'stock' => 50,
        'min_stock' => 10,
    ])->assertRedirect(route('product-stock.index'));

    $this->assertDatabaseHas('product_stock', [
        'product_id' => $product->id,
        'branch_id' => $branch->id,
        'stock' => 50,
    ]);
});

test('store updates existing stock via updateOrCreate', function () {
    $existing = ProductStock::factory()->create(['stock' => 10]);

    $this->post(route('product-stock.store'), [
        'product_id' => $existing->product_id,
        'branch_id' => $existing->branch_id,
        'stock' => 99,
        'min_stock' => 5,
    ])->assertRedirect(route('product-stock.index'));

    $this->assertDatabaseHas('product_stock', [
        'id' => $existing->id,
        'stock' => 99,
    ]);
});

test('store validates required fields', function () {
    $this->post(route('product-stock.store'), [])
        ->assertSessionHasErrors(['product_id', 'branch_id', 'stock', 'min_stock']);
});

test('edit page renders', function () {
    $stock = ProductStock::factory()->create();

    $this->get(route('product-stock.edit', $stock))
        ->assertOk()
        ->assertInertia(
            fn($page) => $page
                ->component('product-stock/edit')
                ->has('stock')
        );
});

test('update modifies stock values', function () {
    $stock = ProductStock::factory()->create(['stock' => 10, 'min_stock' => 5]);

    $this->put(route('product-stock.update', $stock), [
        'stock' => 75,
        'min_stock' => 15,
    ])->assertRedirect(route('product-stock.index'));

    $this->assertDatabaseHas('product_stock', [
        'id' => $stock->id,
        'stock' => 75,
        'min_stock' => 15,
    ]);
});
