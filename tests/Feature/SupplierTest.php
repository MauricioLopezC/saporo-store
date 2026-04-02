<?php

use App\Models\Supplier;
use App\Models\User;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->actingAs($this->user);
});

test('index lists suppliers', function () {
    Supplier::factory()->count(3)->create();

    $this->get(route('suppliers.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('suppliers/index')
            ->has('suppliers.data', 3)
        );
});

test('guests cannot access suppliers', function () {
    auth()->logout();

    $this->get(route('suppliers.index'))->assertRedirect(route('login'));
});

test('create page renders', function () {
    $this->get(route('suppliers.create'))->assertOk();
});

test('store creates a supplier', function () {
    $this->post(route('suppliers.store'), [
        'name' => 'Proveedor XYZ',
        'contact_name' => 'Juan Pérez',
        'email' => 'juan@xyz.com',
        'phone' => '555-0001',
        'address' => 'Calle Uno #10',
        'is_active' => true,
    ])->assertRedirect(route('suppliers.index'));

    $this->assertDatabaseHas('suppliers', ['name' => 'Proveedor XYZ']);
});

test('store validates required fields', function () {
    $this->post(route('suppliers.store'), [])
        ->assertSessionHasErrors(['name']);
});

test('store rejects duplicate name', function () {
    Supplier::factory()->create(['name' => 'Nombre Duplicado']);

    $this->post(route('suppliers.store'), ['name' => 'Nombre Duplicado', 'is_active' => true])
        ->assertSessionHasErrors(['name']);
});

test('edit page renders', function () {
    $supplier = Supplier::factory()->create();

    $this->get(route('suppliers.edit', $supplier))->assertOk();
});

test('update modifies a supplier', function () {
    $supplier = Supplier::factory()->create();

    $this->put(route('suppliers.update', $supplier), [
        'name' => 'Proveedor Editado',
        'is_active' => false,
    ])->assertRedirect(route('suppliers.index'));

    $this->assertDatabaseHas('suppliers', ['id' => $supplier->id, 'name' => 'Proveedor Editado']);
});

test('destroy soft deletes a supplier', function () {
    $supplier = Supplier::factory()->create();

    $this->delete(route('suppliers.destroy', $supplier))
        ->assertRedirect(route('suppliers.index'));

    $this->assertSoftDeleted($supplier);
});
