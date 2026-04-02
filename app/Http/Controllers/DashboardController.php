<?php

namespace App\Http\Controllers;

use App\Enums\SaleStatus;
use App\Models\ProductStock;
use App\Models\Sale;
use App\Models\SaleItem;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $mesActual = now()->month;
        $anioActual = now()->year;

        // KPIs
        $ventasHoy = Sale::completed()
            ->whereDate('created_at', today())
            ->sum('total');

        $ventasMes = Sale::completed()
            ->whereMonth('created_at', $mesActual)
            ->whereYear('created_at', $anioActual)
            ->sum('total');

        $cantidadVentasMes = Sale::completed()
            ->whereMonth('created_at', $mesActual)
            ->whereYear('created_at', $anioActual)
            ->count();

        $ticketPromedio = $cantidadVentasMes > 0
            ? round($ventasMes / $cantidadVentasMes, 2)
            : 0;

        $stockBajoCount = ProductStock::whereColumn('stock', '<=', 'min_stock')->count();

        // Ventas por día — últimos 30 días
        $ventasPorDia = Sale::completed()
            ->where('created_at', '>=', now()->subDays(29)->startOfDay())
            ->selectRaw('DATE(created_at) as fecha, SUM(total) as total')
            ->groupBy('fecha')
            ->orderBy('fecha')
            ->get()
            ->map(fn ($row) => [
                'fecha' => $row->fecha,
                'total' => (float) $row->total,
            ]);

        // Top 5 productos más vendidos del mes
        $topProductos = SaleItem::query()
            ->join('sales', 'sale_items.sale_id', '=', 'sales.id')
            ->join('products', 'sale_items.product_id', '=', 'products.id')
            ->where('sales.status', SaleStatus::Completed)
            ->whereMonth('sales.created_at', $mesActual)
            ->whereYear('sales.created_at', $anioActual)
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

        // Ventas por categoría del mes
        $ventasPorCategoria = SaleItem::query()
            ->join('sales', 'sale_items.sale_id', '=', 'sales.id')
            ->join('products', 'sale_items.product_id', '=', 'products.id')
            ->join('categories', 'products.category_id', '=', 'categories.id')
            ->where('sales.status', SaleStatus::Completed)
            ->whereMonth('sales.created_at', $mesActual)
            ->whereYear('sales.created_at', $anioActual)
            ->whereNull('sales.deleted_at')
            ->selectRaw('categories.name, SUM(sale_items.subtotal) as total')
            ->groupBy('categories.id', 'categories.name')
            ->orderByDesc('total')
            ->get()
            ->map(fn ($row) => [
                'name' => $row->name,
                'total' => (float) $row->total,
            ]);

        // Últimas 5 ventas
        $ultimasVentas = Sale::with('customer:id,name')
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

        // Alertas de stock bajo
        $alertasStock = ProductStock::with('product:id,name,sku', 'branch:id,name')
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

        return Inertia::render('dashboard', [
            'kpis' => [
                'ventas_hoy' => (float) $ventasHoy,
                'ventas_mes' => (float) $ventasMes,
                'ticket_promedio' => (float) $ticketPromedio,
                'stock_bajo_count' => $stockBajoCount,
            ],
            'ventas_por_dia' => $ventasPorDia,
            'top_productos' => $topProductos,
            'ventas_por_categoria' => $ventasPorCategoria,
            'ultimas_ventas' => $ultimasVentas,
            'alertas_stock' => $alertasStock,
        ]);
    }
}
