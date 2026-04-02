<?php

namespace App\Http\Controllers;

use App\Enums\SaleStatus;
use App\Enums\StockMovementType;
use App\Http\Requests\StoreSaleRequest;
use App\Http\Requests\UpdateSaleRequest;
use App\Models\Branch;
use App\Models\Customer;
use App\Models\Product;
use App\Models\ProductStock;
use App\Models\Sale;
use App\Models\StockMovement;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class SaleController extends Controller
{
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
        $data = $request->validated();

        $sale = DB::transaction(function () use ($data) {
            $saleNumber = 'VTA-'.str_pad(Sale::withTrashed()->count() + 1, 6, '0', STR_PAD_LEFT);

            $itemSubtotals = collect($data['items'])->map(function ($item) {
                $discount = $item['discount'] ?? 0;
                $subtotal = ($item['unit_price'] - $discount) * $item['quantity'];

                return array_merge($item, ['subtotal' => round($subtotal, 2), 'discount' => $discount]);
            });

            $subtotal = $itemSubtotals->sum('subtotal');
            $discount = $data['discount'] ?? 0;
            $tax = $data['tax'] ?? 0;
            $total = $subtotal - $discount + $tax;

            $sale = Sale::create([
                'sale_number' => $saleNumber,
                'branch_id' => $data['branch_id'],
                'customer_id' => $data['customer_id'] ?? null,
                'user_id' => Auth::id(),
                'status' => $data['status'],
                'subtotal' => $subtotal,
                'discount' => $discount,
                'tax' => $tax,
                'total' => $total,
                'notes' => $data['notes'] ?? null,
            ]);

            foreach ($itemSubtotals as $item) {
                $sale->items()->create([
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'discount' => $item['discount'],
                    'subtotal' => $item['subtotal'],
                ]);
            }

            if ($sale->status === SaleStatus::Completed) {
                $this->processStockOut($sale);
            }

            return $sale;
        });

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
        $data = $request->validated();
        $previousStatus = $sale->status;

        DB::transaction(function () use ($data, $sale, $previousStatus) {
            $discount = $data['discount'] ?? $sale->discount;
            $tax = $data['tax'] ?? $sale->tax;
            $total = $sale->subtotal - $discount + $tax;

            $sale->update([
                'status' => $data['status'],
                'discount' => $discount,
                'tax' => $tax,
                'total' => $total,
                'notes' => $data['notes'] ?? null,
            ]);

            if ($previousStatus === SaleStatus::Pending && $sale->fresh()->status === SaleStatus::Completed) {
                $this->processStockOut($sale->load('items'));
            }
        });

        return to_route('sales.show', $sale)
            ->with('success', 'Venta actualizada correctamente.');
    }

    public function destroy(Sale $sale): RedirectResponse
    {
        $sale->delete();

        return to_route('sales.index')
            ->with('success', "Venta {$sale->sale_number} eliminada correctamente.");
    }

    private function processStockOut(Sale $sale): void
    {
        foreach ($sale->items as $item) {
            $stock = ProductStock::where('product_id', $item->product_id)
                ->where('branch_id', $sale->branch_id)
                ->first();

            $previousStock = $stock?->stock ?? 0;
            $currentStock = max(0, $previousStock - $item->quantity);

            if ($stock) {
                $stock->decrement('stock', $item->quantity);
            }

            StockMovement::create([
                'product_id' => $item->product_id,
                'branch_id' => $sale->branch_id,
                'user_id' => Auth::id(),
                'type' => StockMovementType::Out,
                'quantity' => $item->quantity,
                'previous_stock' => $previousStock,
                'current_stock' => $currentStock,
                'reason' => "Venta {$sale->sale_number}",
                'reference_id' => $sale->id,
            ]);
        }
    }
}
