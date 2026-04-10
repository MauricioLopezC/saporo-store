<?php

namespace App\Http\Controllers;

use App\Services\DashboardService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(private readonly DashboardService $dashboardService) {}

    public function __invoke(Request $request): Response
    {
        return Inertia::render('dashboard', [
            'kpis' => $this->dashboardService->getKpis(),
            'ventas_por_dia' => $this->dashboardService->getSalesByDay(),
            'top_productos' => $this->dashboardService->getTopProducts(),
            'ventas_por_categoria' => $this->dashboardService->getSalesByCategory(),
            'ultimas_ventas' => $this->dashboardService->getRecentSales(),
            'alertas_stock' => $this->dashboardService->getLowStockAlerts(),
        ]);
    }
}
