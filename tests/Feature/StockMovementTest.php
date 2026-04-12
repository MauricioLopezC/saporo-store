<?php

use App\Enums\StockMovementType;
use App\Models\Branch;
use App\Models\Product;
use App\Models\ProductStock;
use App\Models\StockMovement;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->actingAs($this->user);
});

test('index lists stock movements', function () {
    $branch = Branch::factory()->create();
    $product = Product::factory()->create();
    ProductStock::factory()->create(['product_id' => $product->id, 'branch_id' => $branch->id, 'stock' => 10]);

    StockMovement::create([
        'product_id' => $product->id,
        'branch_id' => $branch->id,
        'user_id' => $this->user->id,
        'type' => StockMovementType::In,
        'quantity' => 10,
        'previous_stock' => 0,
        'current_stock' => 10,
        'reason' => 'Stock inicial',
    ]);

    $this->get(route('stock-movements.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('stock-movements/index')
            ->has('movements.data', 1)
            ->has('branches')
            ->has('types')
            ->has('filters')
        );
});

test('guests cannot access stock movements', function () {
    Auth::logout();

    $this->get(route('stock-movements.index'))->assertRedirect(route('login'));
});

test('index filters by type', function () {
    $branch = Branch::factory()->create();
    $product = Product::factory()->create();

    StockMovement::create([
        'product_id' => $product->id,
        'branch_id' => $branch->id,
        'user_id' => $this->user->id,
        'type' => StockMovementType::In,
        'quantity' => 10,
        'previous_stock' => 0,
        'current_stock' => 10,
        'reason' => 'Entrada',
    ]);

    StockMovement::create([
        'product_id' => $product->id,
        'branch_id' => $branch->id,
        'user_id' => $this->user->id,
        'type' => StockMovementType::Out,
        'quantity' => 3,
        'previous_stock' => 10,
        'current_stock' => 7,
        'reason' => 'Salida',
    ]);

    $this->get(route('stock-movements.index', ['type' => 'IN']))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->has('movements.data', 1));
});

test('create page renders', function () {
    $this->get(route('stock-movements.create'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('stock-movements/create')
            ->has('products')
            ->has('branches')
            ->has('types')
        );
});

test('store creates stock in movement and increments product stock', function () {
    $branch = Branch::factory()->create();
    $product = Product::factory()->create();
    ProductStock::factory()->create(['product_id' => $product->id, 'branch_id' => $branch->id, 'stock' => 10]);

    $this->post(route('stock-movements.store'), [
        'product_id' => $product->id,
        'branch_id' => $branch->id,
        'type' => 'IN',
        'quantity' => 15,
        'reason' => 'Compra a proveedor',
    ])->assertRedirect(route('stock-movements.index'));

    expect(ProductStock::first()->stock)->toBe(25);
    expect(StockMovement::count())->toBe(1);

    $movement = StockMovement::first();
    expect($movement->type->value)->toBe('IN');
    expect($movement->previous_stock)->toBe(10);
    expect($movement->current_stock)->toBe(25);
    expect((float) $movement->quantity)->toBe(15.0);
    expect($movement->reason)->toBe('Compra a proveedor');
});

test('store creates positive adjustment and increments stock', function () {
    $branch = Branch::factory()->create();
    $product = Product::factory()->create();
    ProductStock::factory()->create(['product_id' => $product->id, 'branch_id' => $branch->id, 'stock' => 20]);

    $this->post(route('stock-movements.store'), [
        'product_id' => $product->id,
        'branch_id' => $branch->id,
        'type' => 'ADJUSTMENT',
        'quantity' => 5,
        'reason' => 'Conteo físico',
    ])->assertRedirect(route('stock-movements.index'));

    expect(ProductStock::first()->stock)->toBe(25);

    $movement = StockMovement::first();
    expect($movement->type->value)->toBe('ADJUSTMENT');
    expect($movement->previous_stock)->toBe(20);
    expect($movement->current_stock)->toBe(25);
});

test('store creates negative adjustment and decrements stock', function () {
    $branch = Branch::factory()->create();
    $product = Product::factory()->create();
    ProductStock::factory()->create(['product_id' => $product->id, 'branch_id' => $branch->id, 'stock' => 20]);

    $this->post(route('stock-movements.store'), [
        'product_id' => $product->id,
        'branch_id' => $branch->id,
        'type' => 'ADJUSTMENT',
        'quantity' => -8,
        'reason' => 'Merma detectada',
    ])->assertRedirect(route('stock-movements.index'));

    expect(ProductStock::first()->stock)->toBe(12);

    $movement = StockMovement::first();
    expect((float) $movement->quantity)->toBe(8.0);
    expect($movement->previous_stock)->toBe(20);
    expect($movement->current_stock)->toBe(12);
});

test('store validates required fields', function () {
    $this->post(route('stock-movements.store'), [])
        ->assertSessionHasErrors(['product_id', 'branch_id', 'type', 'quantity', 'reason']);
});

test('store rejects zero quantity', function () {
    $branch = Branch::factory()->create();
    $product = Product::factory()->create();
    ProductStock::factory()->create(['product_id' => $product->id, 'branch_id' => $branch->id, 'stock' => 10]);

    $this->post(route('stock-movements.store'), [
        'product_id' => $product->id,
        'branch_id' => $branch->id,
        'type' => 'IN',
        'quantity' => 0,
        'reason' => 'Test',
    ])->assertSessionHasErrors('quantity');
});

test('store rejects negative quantity for In type', function () {
    $branch = Branch::factory()->create();
    $product = Product::factory()->create();
    ProductStock::factory()->create(['product_id' => $product->id, 'branch_id' => $branch->id, 'stock' => 10]);

    $this->post(route('stock-movements.store'), [
        'product_id' => $product->id,
        'branch_id' => $branch->id,
        'type' => 'IN',
        'quantity' => -5,
        'reason' => 'Test',
    ])->assertSessionHasErrors('quantity');
});

test('store rejects adjustment when no product stock exists for branch', function () {
    $branch = Branch::factory()->create();
    $product = Product::factory()->create();

    $this->post(route('stock-movements.store'), [
        'product_id' => $product->id,
        'branch_id' => $branch->id,
        'type' => 'ADJUSTMENT',
        'quantity' => 5,
        'reason' => 'Test',
    ])->assertSessionHasErrors('quantity');
});
