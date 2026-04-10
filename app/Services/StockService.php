<?php

namespace App\Services;

use App\Enums\StockMovementType;
use App\Models\ProductStock;
use App\Models\Sale;
use App\Models\StockMovement;
use Illuminate\Support\Facades\Auth;

class StockService
{
    /**
     * @param array{
     *     product_id: int,
     *     branch_id: int,
     *     type: string,
     *     quantity: int|float,
     *     reason: string,
     * } $data
     */
    public function applyMovement(array $data): StockMovement
    {
        $stock = ProductStock::where('product_id', $data['product_id'])
            ->where('branch_id', $data['branch_id'])
            ->lockForUpdate()
            ->firstOrFail();

        $previous = $stock->stock;

        if ($data['type'] === StockMovementType::In->value) {
            $stock->increment('stock', $data['quantity']);
            $current = $previous + $data['quantity'];
        } else {
            $newStock = max(0, $previous + $data['quantity']);
            $stock->update(['stock' => $newStock]);
            $current = $newStock;
        }

        return StockMovement::create([
            'product_id' => $data['product_id'],
            'branch_id' => $data['branch_id'],
            'user_id' => Auth::id(),
            'type' => $data['type'],
            'quantity' => abs($data['quantity']),
            'previous_stock' => $previous,
            'current_stock' => $current,
            'reason' => $data['reason'],
        ]);
    }

    public function processStockOut(Sale $sale): void
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

    public function reverseStockOut(Sale $sale): void
    {
        foreach ($sale->items as $item) {
            $stock = ProductStock::where('product_id', $item->product_id)
                ->where('branch_id', $sale->branch_id)
                ->lockForUpdate()
                ->first();

            if (! $stock) {
                continue;
            }

            $previous = $stock->stock;
            $stock->increment('stock', $item->quantity);

            StockMovement::create([
                'product_id' => $item->product_id,
                'branch_id' => $sale->branch_id,
                'user_id' => Auth::id(),
                'type' => StockMovementType::In,
                'quantity' => $item->quantity,
                'previous_stock' => $previous,
                'current_stock' => $previous + $item->quantity,
                'reason' => "Reversión venta {$sale->sale_number}",
                'reference_id' => $sale->id,
            ]);
        }
    }
}
