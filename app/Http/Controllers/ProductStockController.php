<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreProductStockRequest;
use App\Http\Requests\UpdateProductStockRequest;
use App\Models\Branch;
use App\Models\Product;
use App\Models\ProductStock;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProductStockController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('product-stock/index', [
            'stocks' => ProductStock::query()
                ->with('product:id,name,sku', 'branch:id,name')
                ->when($request->branch_id, fn ($q) => $q->where('branch_id', $request->branch_id))
                ->orderBy('branch_id')
                ->paginate(20)
                ->withQueryString(),
            'branches' => Branch::query()->where('is_active', true)->orderBy('name')->get(['id', 'name']),
            'filters' => $request->only('branch_id'),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('product-stock/create', [
            'products' => Product::query()->where('is_active', true)->orderBy('name')->get(['id', 'name', 'sku']),
            'branches' => Branch::query()->where('is_active', true)->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(StoreProductStockRequest $request): RedirectResponse
    {
        ProductStock::updateOrCreate(
            ['product_id' => $request->product_id, 'branch_id' => $request->branch_id],
            ['stock' => $request->stock, 'min_stock' => $request->min_stock],
        );

        return to_route('product-stock.index')
            ->with('success', 'Stock registrado correctamente.');
    }

    public function edit(ProductStock $productStock): Response
    {
        return Inertia::render('product-stock/edit', [
            'stock' => $productStock->load('product:id,name,sku', 'branch:id,name'),
        ]);
    }

    public function update(UpdateProductStockRequest $request, ProductStock $productStock): RedirectResponse
    {
        $productStock->update($request->validated());

        return to_route('product-stock.index')
            ->with('success', 'Stock actualizado correctamente.');
    }
}
