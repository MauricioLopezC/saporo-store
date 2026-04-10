<?php

namespace App\Http\Controllers;

use App\Enums\StockMovementType;
use App\Http\Requests\StoreStockMovementRequest;
use App\Models\Branch;
use App\Models\Product;
use App\Models\StockMovement;
use App\Services\StockService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class StockMovementController extends Controller
{
    public function __construct(private readonly StockService $stockService) {}

    public function index(Request $request): Response
    {
        return Inertia::render('stock-movements/index', [
            'movements' => StockMovement::query()
                ->with('product:id,name,sku', 'branch:id,name', 'user:id,name')
                ->when($request->type, fn ($q) => $q->where('type', $request->type))
                ->when($request->branch_id, fn ($q) => $q->where('branch_id', $request->branch_id))
                ->when($request->date_from, fn ($q) => $q->whereDate('created_at', '>=', $request->date_from))
                ->when($request->date_to, fn ($q) => $q->whereDate('created_at', '<=', $request->date_to))
                ->latest('created_at')
                ->paginate(20)
                ->withQueryString(),
            'branches' => Branch::query()->where('is_active', true)->orderBy('name')->get(['id', 'name']),
            'types' => collect(StockMovementType::cases())->map(fn ($t) => ['value' => $t->value, 'label' => $t->label()]),
            'filters' => $request->only('type', 'branch_id', 'date_from', 'date_to'),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('stock-movements/create', [
            'branches' => Branch::query()->where('is_active', true)->orderBy('name')->get(['id', 'name']),
            'products' => Product::query()->where('is_active', true)->orderBy('name')->get(['id', 'name', 'sku']),
            'types' => [
                ['value' => StockMovementType::In->value, 'label' => StockMovementType::In->label()],
                ['value' => StockMovementType::Adjustment->value, 'label' => StockMovementType::Adjustment->label()],
            ],
        ]);
    }

    public function store(StoreStockMovementRequest $request): RedirectResponse
    {
        DB::transaction(fn () => $this->stockService->applyMovement($request->validated()));

        return to_route('stock-movements.index')
            ->with('success', 'Movimiento de stock registrado correctamente.');
    }
}
