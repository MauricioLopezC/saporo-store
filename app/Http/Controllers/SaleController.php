<?php

namespace App\Http\Controllers;

use App\Enums\SaleStatus;
use App\Http\Requests\StoreSaleRequest;
use App\Http\Requests\UpdateSaleRequest;
use App\Models\Branch;
use App\Models\Customer;
use App\Models\Product;
use App\Models\Sale;
use App\Services\SaleService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SaleController extends Controller
{
    public function __construct(private readonly SaleService $saleService) {}

    public function index(Request $request): Response
    {
        return Inertia::render('sales/index', [
            'sales' => Sale::query()
                ->with('branch:id,name', 'customer:id,name', 'user:id,name')
                ->when($request->status, fn ($q) => $q->where('status', $request->status))
                ->when($request->branch_id, fn ($q) => $q->where('branch_id', $request->branch_id))
                ->orderByDesc('created_at')
                ->paginate(20)
                ->withQueryString(),
            'branches' => Branch::query()->where('is_active', true)->orderBy('name')->get(['id', 'name']),
            'filters' => $request->only('status', 'branch_id'),
            'statuses' => collect(SaleStatus::cases())->map(fn ($s) => ['value' => $s->value, 'label' => $s->label()]),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('sales/create', [
            'branches' => Branch::query()->where('is_active', true)->orderBy('name')->get(['id', 'name']),
            'customers' => Customer::query()->where('is_active', true)->orderBy('name')->get(['id', 'name']),
            'products' => Product::query()->where('is_active', true)->orderBy('name')->get(['id', 'name', 'sku', 'price', 'unit']),
        ]);
    }

    public function store(StoreSaleRequest $request): RedirectResponse
    {
        $sale = $this->saleService->create($request->validated());

        return to_route('sales.show', $sale)
            ->with('success', "Venta {$sale->sale_number} registrada correctamente.");
    }

    public function show(Sale $sale): Response
    {
        return Inertia::render('sales/show', [
            'sale' => $sale->load('branch:id,name', 'customer:id,name', 'user:id,name', 'items.product:id,name,sku'),
        ]);
    }

    public function edit(Sale $sale): Response
    {
        return Inertia::render('sales/edit', [
            'sale' => $sale->load('items.product:id,name,sku'),
            'statuses' => collect(SaleStatus::cases())->map(fn ($s) => ['value' => $s->value, 'label' => $s->label()]),
        ]);
    }

    public function update(UpdateSaleRequest $request, Sale $sale): RedirectResponse
    {
        $this->saleService->update($sale, $request->validated());

        return to_route('sales.show', $sale)
            ->with('success', 'Venta actualizada correctamente.');
    }

    public function destroy(Sale $sale): RedirectResponse
    {
        $this->saleService->delete($sale);

        return to_route('sales.index')
            ->with('success', "Venta {$sale->sale_number} eliminada correctamente.");
    }
}
