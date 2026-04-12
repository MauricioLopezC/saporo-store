<?php

use App\Enums\SaleStatus;
use App\Models\Branch;
use App\Models\Product;
use App\Models\ProductStock;
use App\Models\Sale;
use App\Models\StockMovement;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->actingAs($this->user);
});

test('index lists sales', function () {
    Sale::factory()->count(3)->create();

    $this->get(route('sales.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('sales/index')
            ->has('sales.data', 3)
            ->has('statuses')
            ->has('branches')
        );
});

test('guests cannot access sales', function () {
    Auth::logout();

    $this->get(route('sales.index'))->assertRedirect(route('login'));
});

test('index filters by status', function () {
    Sale::factory()->pending()->count(2)->create();
    Sale::factory()->count(3)->create(); // completed

    $this->get(route('sales.index', ['status' => 'PENDING']))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->has('sales.data', 2));
});

test('create page renders with products, branches and customers', function () {
    $this->get(route('sales.create'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('sales/create')
            ->has('products')
            ->has('branches')
            ->has('customers')
        );
});

test('store creates a pending sale with items', function () {
    $branch = Branch::factory()->create();
    $product = Product::factory()->create(['price' => 100]);

    $this->post(route('sales.store'), [
        'branch_id' => $branch->id,
        'customer_id' => null,
        'status' => 'PENDING',
        'discount' => 0,
        'tax' => 0,
        'notes' => null,
        'items' => [
            ['product_id' => $product->id, 'quantity' => 2, 'unit_price' => 100, 'discount' => 0],
        ],
    ])->assertRedirect();

    $sale = Sale::first();
    expect($sale->status)->toBe(SaleStatus::Pending);
    expect($sale->subtotal)->toBe('200.00');
    expect($sale->total)->toBe('200.00');
    expect($sale->items)->toHaveCount(1);
    expect($sale->sale_number)->toStartWith('VTA-');
});

test('store completed sale decrements product stock', function () {
    $branch = Branch::factory()->create();
    $product = Product::factory()->create(['price' => 50]);
    ProductStock::factory()->create(['product_id' => $product->id, 'branch_id' => $branch->id, 'stock' => 20]);

    $this->post(route('sales.store'), [
        'branch_id' => $branch->id,
        'customer_id' => null,
        'status' => 'COMPLETED',
        'discount' => 0,
        'tax' => 0,
        'notes' => null,
        'items' => [
            ['product_id' => $product->id, 'quantity' => 5, 'unit_price' => 50, 'discount' => 0],
        ],
    ])->assertRedirect();

    expect(ProductStock::first()->stock)->toBe(15);
    expect(StockMovement::count())->toBe(1);
});

test('store completed sale creates stock movement', function () {
    $branch = Branch::factory()->create();
    $product = Product::factory()->create();
    ProductStock::factory()->create(['product_id' => $product->id, 'branch_id' => $branch->id, 'stock' => 10]);

    $this->post(route('sales.store'), [
        'branch_id' => $branch->id,
        'customer_id' => null,
        'status' => 'COMPLETED',
        'discount' => 0,
        'tax' => 0,
        'notes' => null,
        'items' => [
            ['product_id' => $product->id, 'quantity' => 3, 'unit_price' => 10, 'discount' => 0],
        ],
    ]);

    $movement = StockMovement::first();
    expect($movement->previous_stock)->toBe(10);
    expect($movement->current_stock)->toBe(7);
    expect($movement->type->value)->toBe('OUT');
});

test('store validates required fields', function () {
    $this->post(route('sales.store'), [])
        ->assertSessionHasErrors(['branch_id', 'status', 'items']);
});

test('show renders sale with items', function () {
    $sale = Sale::factory()->create();

    $this->get(route('sales.show', $sale))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('sales/show')
            ->has('sale')
        );
});

test('edit page renders', function () {
    $sale = Sale::factory()->create();

    $this->get(route('sales.edit', $sale))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('sales/edit')
            ->has('statuses')
        );
});

test('update changes sale status and notes', function () {
    $sale = Sale::factory()->pending()->create();

    $this->put(route('sales.update', $sale), [
        'status' => 'CANCELLED',
        'discount' => 0,
        'tax' => 0,
        'notes' => 'Cancelada por el cliente',
    ])->assertRedirect(route('sales.show', $sale));

    expect($sale->fresh()->status)->toBe(SaleStatus::Cancelled);
    expect($sale->fresh()->notes)->toBe('Cancelada por el cliente');
});

test('update pending to completed triggers stock out', function () {
    $branch = Branch::factory()->create();
    $product = Product::factory()->create();
    ProductStock::factory()->create(['product_id' => $product->id, 'branch_id' => $branch->id, 'stock' => 10]);

    $sale = Sale::factory()->pending()->create(['branch_id' => $branch->id]);
    $sale->items()->create([
        'product_id' => $product->id,
        'quantity' => 4,
        'unit_price' => 10,
        'discount' => 0,
        'subtotal' => 40,
    ]);

    $this->put(route('sales.update', $sale), [
        'status' => 'COMPLETED',
        'discount' => 0,
        'tax' => 0,
        'notes' => null,
    ]);

    expect(ProductStock::first()->stock)->toBe(6);
    expect(StockMovement::count())->toBe(1);
});

test('destroy soft deletes a sale', function () {
    $sale = Sale::factory()->create();

    $this->delete(route('sales.destroy', $sale))
        ->assertRedirect(route('sales.index'));

    $this->assertSoftDeleted($sale);
});

test('destroy completed sale reverses stock and creates stock movement', function () {
    $branch = Branch::factory()->create();
    $product = Product::factory()->create();
    ProductStock::factory()->create(['product_id' => $product->id, 'branch_id' => $branch->id, 'stock' => 5]);

    $sale = Sale::factory()->create(['branch_id' => $branch->id, 'status' => 'COMPLETED']);
    $sale->items()->create([
        'product_id' => $product->id,
        'quantity' => 3,
        'unit_price' => 10,
        'discount' => 0,
        'subtotal' => 30,
    ]);

    $this->delete(route('sales.destroy', $sale))
        ->assertRedirect(route('sales.index'));

    $this->assertSoftDeleted($sale);
    expect(ProductStock::first()->stock)->toBe(8);
    expect(StockMovement::count())->toBe(1);

    $movement = StockMovement::first();
    expect($movement->type->value)->toBe('IN');
    expect($movement->previous_stock)->toBe(5);
    expect($movement->current_stock)->toBe(8);
    expect($movement->reason)->toContain('Reversión venta');
});

test('destroy pending sale does not create stock movement', function () {
    $sale = Sale::factory()->pending()->create();

    $this->delete(route('sales.destroy', $sale))
        ->assertRedirect(route('sales.index'));

    $this->assertSoftDeleted($sale);
    expect(StockMovement::count())->toBe(0);
});

test('store rejects completed sale when stock is insufficient', function () {
    $branch = Branch::factory()->create();
    $product = Product::factory()->create(['price' => 50]);
    ProductStock::factory()->create(['product_id' => $product->id, 'branch_id' => $branch->id, 'stock' => 3]);

    $this->post(route('sales.store'), [
        'branch_id' => $branch->id,
        'customer_id' => null,
        'status' => 'COMPLETED',
        'discount' => 0,
        'tax' => 0,
        'notes' => null,
        'items' => [
            ['product_id' => $product->id, 'quantity' => 5, 'unit_price' => 50, 'discount' => 0],
        ],
    ])->assertSessionHasErrors('items.0.quantity');

    expect(Sale::count())->toBe(0);
});

test('store allows pending sale when stock is insufficient', function () {
    $branch = Branch::factory()->create();
    $product = Product::factory()->create(['price' => 50]);
    ProductStock::factory()->create(['product_id' => $product->id, 'branch_id' => $branch->id, 'stock' => 3]);

    $this->post(route('sales.store'), [
        'branch_id' => $branch->id,
        'customer_id' => null,
        'status' => 'PENDING',
        'discount' => 0,
        'tax' => 0,
        'notes' => null,
        'items' => [
            ['product_id' => $product->id, 'quantity' => 5, 'unit_price' => 50, 'discount' => 0],
        ],
    ])->assertRedirect();

    expect(Sale::count())->toBe(1);
});

test('update to completed rejects when stock is insufficient', function () {
    $branch = Branch::factory()->create();
    $product = Product::factory()->create();
    ProductStock::factory()->create(['product_id' => $product->id, 'branch_id' => $branch->id, 'stock' => 2]);

    $sale = Sale::factory()->pending()->create(['branch_id' => $branch->id]);
    $sale->items()->create([
        'product_id' => $product->id,
        'quantity' => 5,
        'unit_price' => 10,
        'discount' => 0,
        'subtotal' => 50,
    ]);

    $this->put(route('sales.update', $sale), [
        'status' => 'COMPLETED',
        'discount' => 0,
        'tax' => 0,
        'notes' => null,
    ])->assertSessionHasErrors('status');

    expect($sale->fresh()->status->value)->toBe('PENDING');
    expect(StockMovement::count())->toBe(0);
});
