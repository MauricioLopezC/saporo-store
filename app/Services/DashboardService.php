<?php

namespace App\Services;

use App\Enums\SaleStatus;
use App\Models\ProductStock;
use App\Models\Sale;
use App\Models\SaleItem;
use Illuminate\Support\Collection;

class DashboardService
{
    public function getKpis(): array
    {
        $mesActual = now()->month;
        $anioActual = now()->year;

        $ventasMes = Sale::completed()
            ->whereMonth('created_at', $mesActual)
            ->whereYear('created_at', $anioActual)
            ->sum('total');

        $cantidadVentasMes = Sale::completed()
            ->whereMonth('created_at', $mesActual)
            ->whereYear('created_at', $anioActual)
            ->count();

        return [
            'ventas_hoy' => (float) Sale::completed()->whereDate('created_at', today())->sum('total'),
            'ventas_mes' => (float) $ventasMes,
            'ticket_promedio' => $cantidadVentasMes > 0 ? round($ventasMes / $cantidadVentasMes, 2) : 0,
            'stock_bajo_count' => ProductStock::whereColumn('stock', '<=', 'min_stock')->count(),
        ];
    }

    public function getSalesByDay(): Collection
    {
        return Sale::completed()
            ->where('created_at', '>=', now()->subDays(29)->startOfDay())
            ->selectRaw('DATE(created_at) as fecha, SUM(total) as total')
            ->groupBy('fecha')
            ->orderBy('fecha')
            ->get()
            ->map(fn ($row) => [
                'fecha' => $row->fecha,
                'total' => (float) $row->total,
            ]);
    }

    public function getTopProducts(): Collection
    {
        return SaleItem::query()
            ->join('sales', 'sale_items.sale_id', '=', 'sales.id')
            ->join('products', 'sale_items.product_id', '=', 'products.id')
            ->where('sales.status', SaleStatus::Completed)
            ->whereMonth('sales.created_at', now()->month)
            ->whereYear('sales.created_at', now()->year)
            ->whereNull('sales.deleted_at')
            ->selectRaw('products.name, SUM(sale_items.quantity) as total_vendido, SUM(sale_items.subtotal) as total_facturado')
            ->groupBy('products.id', 'products.name')
            ->orderByDesc('total_vendido')
            ->limit(5)
            ->get()
            ->map(fn ($row) => [
                'name' => $row->name,
                'total_vendido' => (float) $row->total_vendido,
                'total_facturado' => (float) $row->total_facturado,
            ]);
    }

    public function getSalesByCategory(): Collection
    {
        return SaleItem::query()
            ->join('sales', 'sale_items.sale_id', '=', 'sales.id')
            ->join('products', 'sale_items.product_id', '=', 'products.id')
            ->join('categories', 'products.category_id', '=', 'categories.id')
            ->where('sales.status', SaleStatus::Completed)
            ->whereMonth('sales.created_at', now()->month)
            ->whereYear('sales.created_at', now()->year)
            ->whereNull('sales.deleted_at')
            ->selectRaw('categories.name, SUM(sale_items.subtotal) as total')
            ->groupBy('categories.id', 'categories.name')
            ->orderByDesc('total')
            ->get()
            ->map(fn ($row) => [
                'name' => $row->name,
                'total' => (float) $row->total,
            ]);
    }

    public function getRecentSales(): Collection
    {
        return Sale::with('customer:id,name')
            ->latest()
            ->limit(5)
            ->get(['id', 'sale_number', 'customer_id', 'status', 'total', 'created_at'])
            ->map(fn ($sale) => [
                'id' => $sale->id,
                'sale_number' => $sale->sale_number,
                'customer' => $sale->customer?->name ?? 'Consumidor final',
                'status' => $sale->status->value,
                'status_label' => $sale->status->label(),
                'total' => (float) $sale->total,
                'created_at' => $sale->created_at->toISOString(),
            ]);
    }

    public function getLowStockAlerts(): Collection
    {
        return ProductStock::with('product:id,name,sku', 'branch:id,name')
            ->whereColumn('stock', '<=', 'min_stock')
            ->orderByRaw('(stock - min_stock) ASC')
            ->limit(10)
            ->get()
            ->map(fn ($s) => [
                'sku' => $s->product->sku,
                'name' => $s->product->name,
                'branch' => $s->branch->name,
                'stock' => (float) $s->stock,
                'min_stock' => (float) $s->min_stock,
            ]);
    }
}
