<?php

use App\Http\Controllers\BranchController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ProductStockController;
use App\Http\Controllers\SaleController;
use App\Http\Controllers\StockMovementController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    Route::resource('customers', CustomerController::class);
    Route::resource('categories', CategoryController::class)->except('show');
    Route::resource('products', ProductController::class);
    Route::resource('users', UserController::class)->except('show');
    Route::resource('branches', BranchController::class)->except('show');
    Route::resource('suppliers', SupplierController::class)->except('show');
    Route::resource('product-stock', ProductStockController::class)->only(['index', 'create', 'store', 'edit', 'update']);
    Route::resource('sales', SaleController::class);
    Route::resource('stock-movements', StockMovementController::class)->only(['index', 'create', 'store']);
});

require __DIR__.'/settings.php';
