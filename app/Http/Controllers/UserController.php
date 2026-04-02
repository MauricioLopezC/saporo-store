<?php

namespace App\Http\Controllers;

use App\Enums\UserRole;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('users/index', [
            'users' => User::query()
                ->orderBy('name')
                ->paginate(20)
                ->withQueryString(),
            'roles' => collect(UserRole::cases())->map(fn ($role) => [
                'value' => $role->value,
                'label' => $role->label(),
            ]),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('users/create', [
            'roles' => collect(UserRole::cases())->map(fn ($role) => [
                'value' => $role->value,
                'label' => $role->label(),
            ]),
        ]);
    }

    public function store(StoreUserRequest $request): RedirectResponse
    {
        User::create([
            ...$request->safe()->except('password', 'password_confirmation'),
            'password' => Hash::make($request->validated('password')),
            'email_verified_at' => now(),
        ]);

        return to_route('users.index')
            ->with('success', 'Usuario creado correctamente.');
    }

    public function edit(User $user): Response
    {
        return Inertia::render('users/edit', [
            'user' => $user->only('id', 'name', 'email', 'role'),
            'roles' => collect(UserRole::cases())->map(fn ($role) => [
                'value' => $role->value,
                'label' => $role->label(),
            ]),
        ]);
    }

    public function update(UpdateUserRequest $request, User $user): RedirectResponse
    {
        $data = $request->safe()->except('password', 'password_confirmation');

        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->validated('password'));
        }

        $user->update($data);

        return to_route('users.index')
            ->with('success', 'Usuario actualizado correctamente.');
    }

    public function destroy(User $user): RedirectResponse
    {
        $this->authorize('delete', $user);

        $user->delete();

        return to_route('users.index')
            ->with('success', 'Usuario eliminado correctamente.');
    }
}
