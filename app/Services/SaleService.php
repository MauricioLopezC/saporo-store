<?php

namespace App\Services;

use App\Enums\SaleStatus;
use App\Models\Sale;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class SaleService
{
    public function __construct(private readonly StockService $stockService) {}

    /**
     * @param array{
     *     branch_id: int,
     *     customer_id: int|null,
     *     status: string,
     *     subtotal?: float,
     *     discount?: float,
     *     tax?: float,
     *     notes?: string|null,
     *     items: array<array{product_id: int, quantity: float, unit_price: float, discount?: float}>,
     * } $data
     */
    public function create(array $data): Sale
    {
        return DB::transaction(function () use ($data) {
            $saleNumber = 'VTA-' . str_pad(Sale::withTrashed()->count() + 1, 6, '0', STR_PAD_LEFT);

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
                $this->stockService->processStockOut($sale);
            }

            return $sale;
        });
    }

    /**
     * @param array{
     *     status: string,
     *     discount?: float,
     *     tax?: float,
     *     notes?: string|null,
     * } $data
     */
    public function update(Sale $sale, array $data): void
    {
        DB::transaction(function () use ($sale, $data) {
            $previousStatus = $sale->status;

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
                $this->stockService->processStockOut($sale->load('items'));
            }
        });
    }

    public function delete(Sale $sale): void
    {
        DB::transaction(function () use ($sale) {
            if ($sale->status === SaleStatus::Completed) {
                $this->stockService->reverseStockOut($sale->loadMissing('items'));
            }
            $sale->delete();
        });
    }
}
