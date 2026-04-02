<?php

use App\Models\Branch;
use App\Models\User;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->actingAs($this->user);
});

test('index lists branches', function () {
    Branch::factory()->count(3)->create();

    $this->get(route('branches.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('branches/index')
            ->has('branches.data', 3)
        );
});

test('guests cannot access branches', function () {
    auth()->logout();

    $this->get(route('branches.index'))->assertRedirect(route('login'));
});

test('create page renders', function () {
    $this->get(route('branches.create'))->assertOk();
});

test('store creates a branch', function () {
    $this->post(route('branches.store'), [
        'name' => 'Sucursal Norte',
        'address' => 'Av. Norte 100',
        'phone' => '555-1234',
        'is_active' => true,
    ])->assertRedirect(route('branches.index'));

    $this->assertDatabaseHas('branches', ['name' => 'Sucursal Norte']);
});

test('store validates required fields', function () {
    $this->post(route('branches.store'), [])
        ->assertSessionHasErrors(['name', 'address']);
});

test('edit page renders', function () {
    $branch = Branch::factory()->create();

    $this->get(route('branches.edit', $branch))->assertOk();
});

test('update modifies a branch', function () {
    $branch = Branch::factory()->create();

    $this->put(route('branches.update', $branch), [
        'name' => 'Sucursal Editada',
        'address' => 'Calle Nueva 99',
        'phone' => null,
        'is_active' => false,
    ])->assertRedirect(route('branches.index'));

    $this->assertDatabaseHas('branches', ['id' => $branch->id, 'name' => 'Sucursal Editada']);
});

test('destroy deletes a branch', function () {
    $branch = Branch::factory()->create();

    $this->delete(route('branches.destroy', $branch))
        ->assertRedirect(route('branches.index'));

    $this->assertModelMissing($branch);
});
