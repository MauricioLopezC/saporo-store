import { Head, Link } from '@inertiajs/react';
import { AlertTriangle, Package, Receipt, ShoppingCart, TrendingUp } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, Tooltip, XAxis, YAxis } from 'recharts';
import { index as productStockIndex } from '@/actions/App/Http/Controllers/ProductStockController';
import SaleController from '@/actions/App/Http/Controllers/SaleController';
import { index as stockMovementsIndex } from '@/actions/App/Http/Controllers/StockMovementController';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { dashboard } from '@/routes';

const CATEGORY_COLORS = [
    'var(--chart-1)',
    'var(--chart-2)',
    'var(--chart-3)',
    'var(--chart-4)',
    'var(--chart-5)',
];

function formatPeso(value: number): string {
    return `$${Number(value).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

interface Kpis {
    ventas_hoy: number;
    ventas_mes: number;
    ticket_promedio: number;
    stock_bajo_count: number;
}

interface VentaDia {
    fecha: string;
    total: number;
}

interface TopProducto {
    name: string;
    total_vendido: number;
    total_facturado: number;
}

interface VentaCategoria {
    name: string;
    total: number;
}

interface UltimaVenta {
    id: number;
    sale_number: string;
    customer: string;
    status: string;
    status_label: string;
    total: number;
    created_at: string;
}

interface AlertaStock {
    sku: string;
    name: string;
    branch: string;
    stock: number;
    min_stock: number;
}

const statusVariants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    COMPLETED: 'default',
    PENDING: 'secondary',
    CANCELLED: 'destructive',
};

const ventasDiaConfig = {
    total: { label: 'Ventas', color: 'var(--chart-1)' },
} satisfies ChartConfig;

const topProductosConfig = {
    total_vendido: { label: 'Cantidad vendida', color: 'var(--chart-2)' },
} satisfies ChartConfig;

export default function Dashboard({
    kpis,
    ventas_por_dia,
    top_productos,
    ventas_por_categoria,
    ultimas_ventas,
    alertas_stock,
}: {
    kpis: Kpis;
    ventas_por_dia: VentaDia[];
    top_productos: TopProducto[];
    ventas_por_categoria: VentaCategoria[];
    ultimas_ventas: UltimaVenta[];
    alertas_stock: AlertaStock[];
}) {
    const totalCategoria = ventas_por_categoria.reduce((sum, c) => sum + c.total, 0);

    return (
        <>
            <Head title="Dashboard" />

            <div className="space-y-6 p-6">
                <div>
                    <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
                    <p className="text-sm text-muted-foreground">Resumen del negocio</p>
                </div>

                {/* KPI Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Ventas hoy</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold tabular-nums">{formatPeso(kpis.ventas_hoy)}</div>
                            <p className="mt-1 text-xs text-muted-foreground">Ventas completadas hoy</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Ventas del mes</CardTitle>
                            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold tabular-nums">{formatPeso(kpis.ventas_mes)}</div>
                            <p className="mt-1 text-xs text-muted-foreground">Mes corriente</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Ticket promedio</CardTitle>
                            <Receipt className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold tabular-nums">{formatPeso(kpis.ticket_promedio)}</div>
                            <p className="mt-1 text-xs text-muted-foreground">Por venta este mes</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Stock bajo</CardTitle>
                            <AlertTriangle className={`h-4 w-4 ${kpis.stock_bajo_count > 0 ? 'text-destructive' : 'text-muted-foreground'}`} />
                        </CardHeader>
                        <CardContent>
                            <div className={`text-2xl font-bold tabular-nums ${kpis.stock_bajo_count > 0 ? 'text-destructive' : ''}`}>
                                {kpis.stock_bajo_count}
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                                {kpis.stock_bajo_count > 0 ? (
                                    <Link
                                        href={productStockIndex.url({ query: { low_stock: '1' } })}
                                        className="underline underline-offset-2"
                                    >
                                        Ver productos afectados
                                    </Link>
                                ) : (
                                    'Todos en nivel correcto'
                                )}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Gráficos: barras por día + dona por categoría */}
                <div className="grid gap-4 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">Ventas últimos 30 días</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {ventas_por_dia.length === 0 ? (
                                <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
                                    Sin ventas en los últimos 30 días
                                </div>
                            ) : (
                                <ChartContainer config={ventasDiaConfig} className="h-52 w-full">
                                    <BarChart data={ventas_por_dia} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                                        <CartesianGrid vertical={false} strokeDasharray="3 3" />
                                        <XAxis
                                            dataKey="fecha"
                                            tickLine={false}
                                            axisLine={false}
                                            tickFormatter={(v: string) => {
                                                const [, m, d] = v.split('-');
                                                return `${d}/${m}`;
                                            }}
                                            interval="preserveStartEnd"
                                            tick={{ fontSize: 11 }}
                                        />
                                        <YAxis
                                            tickLine={false}
                                            axisLine={false}
                                            tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
                                            tick={{ fontSize: 11 }}
                                            width={42}
                                        />
                                        <Tooltip
                                            content={
                                                <ChartTooltipContent
                                                    formatter={(value) => [formatPeso(value as number), 'Ventas']}
                                                    labelFormatter={(label) => {
                                                        const [y, m, d] = (label as string).split('-');
                                                        return `${d}/${m}/${y}`;
                                                    }}
                                                />
                                            }
                                        />
                                        <Bar dataKey="total" fill="var(--color-total)" radius={[3, 3, 0, 0]} />
                                    </BarChart>
                                </ChartContainer>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">Ventas por categoría — mes actual</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {ventas_por_categoria.length === 0 ? (
                                <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
                                    Sin ventas este mes
                                </div>
                            ) : (
                                <div className="flex items-center gap-6">
                                    <ChartContainer config={{}} className="h-48 w-48 shrink-0">
                                        <PieChart>
                                            <Pie
                                                data={ventas_por_categoria}
                                                dataKey="total"
                                                nameKey="name"
                                                innerRadius={50}
                                                outerRadius={80}
                                                paddingAngle={2}
                                            >
                                                {ventas_por_categoria.map((_, i) => (
                                                    <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value, name) => [formatPeso(value as number), name]} />
                                        </PieChart>
                                    </ChartContainer>
                                    <ul className="flex-1 space-y-2 text-sm">
                                        {ventas_por_categoria.map((cat, i) => (
                                            <li key={cat.name} className="flex items-center justify-between gap-2">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <span
                                                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                                                        style={{ backgroundColor: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }}
                                                    />
                                                    <span className="truncate text-muted-foreground">{cat.name}</span>
                                                </div>
                                                <span className="tabular-nums font-medium shrink-0">
                                                    {totalCategoria > 0 ? Math.round((cat.total / totalCategoria) * 100) : 0}%
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Top 5 productos */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">Top 5 productos más vendidos — mes actual</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {top_productos.length === 0 ? (
                            <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
                                Sin ventas este mes
                            </div>
                        ) : (
                            <ChartContainer config={topProductosConfig} className="h-48 w-full">
                                <BarChart data={top_productos} layout="vertical" margin={{ top: 0, right: 16, left: 8, bottom: 0 }}>
                                    <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                                    <XAxis type="number" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                                    <YAxis
                                        type="category"
                                        dataKey="name"
                                        tickLine={false}
                                        axisLine={false}
                                        width={160}
                                        tick={{ fontSize: 11 }}
                                        tickFormatter={(v: string) => (v.length > 22 ? v.slice(0, 22) + '…' : v)}
                                    />
                                    <Tooltip
                                        content={
                                            <ChartTooltipContent formatter={(value) => [`${value} uds.`, 'Cantidad']} />
                                        }
                                    />
                                    <Bar dataKey="total_vendido" fill="var(--color-total_vendido)" radius={[0, 3, 3, 0]} />
                                </BarChart>
                            </ChartContainer>
                        )}
                    </CardContent>
                </Card>

                {/* Tablas: últimas ventas + alertas de stock */}
                <div className="grid gap-4 lg:grid-cols-2">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-sm font-medium">Últimas ventas</CardTitle>
                            <Link href={SaleController.index.url()} className="text-xs text-muted-foreground underline underline-offset-2">
                                Ver todas
                            </Link>
                        </CardHeader>
                        <CardContent className="p-0">
                            {ultimas_ventas.length === 0 ? (
                                <div className="px-6 py-8 text-center text-sm text-muted-foreground">Sin ventas registradas</div>
                            ) : (
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b bg-muted/50">
                                            <th className="px-4 py-2 text-left font-medium text-muted-foreground">N° venta</th>
                                            <th className="px-4 py-2 text-left font-medium text-muted-foreground">Cliente</th>
                                            <th className="px-4 py-2 text-right font-medium text-muted-foreground">Total</th>
                                            <th className="px-4 py-2 text-left font-medium text-muted-foreground">Estado</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {ultimas_ventas.map((venta) => (
                                            <tr key={venta.id} className="hover:bg-muted/30">
                                                <td className="px-4 py-2">
                                                    <Link
                                                        href={SaleController.show.url(venta.id)}
                                                        className="font-mono text-xs font-medium hover:underline"
                                                    >
                                                        {venta.sale_number}
                                                    </Link>
                                                </td>
                                                <td className="px-4 py-2 text-muted-foreground">{venta.customer}</td>
                                                <td className="px-4 py-2 text-right tabular-nums font-medium">{formatPeso(venta.total)}</td>
                                                <td className="px-4 py-2">
                                                    <Badge variant={statusVariants[venta.status] ?? 'outline'} className="text-xs">
                                                        {venta.status_label}
                                                    </Badge>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-sm font-medium">Alertas de stock bajo</CardTitle>
                            <Link href={stockMovementsIndex.url()} className="text-xs text-muted-foreground underline underline-offset-2">
                                Registrar movimiento
                            </Link>
                        </CardHeader>
                        <CardContent className="p-0">
                            {alertas_stock.length === 0 ? (
                                <div className="px-6 py-8 text-center text-sm text-muted-foreground">
                                    <Package className="mx-auto mb-2 h-6 w-6 text-muted-foreground/50" />
                                    Todos los productos en nivel correcto
                                </div>
                            ) : (
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b bg-muted/50">
                                            <th className="px-4 py-2 text-left font-medium text-muted-foreground">Producto</th>
                                            <th className="px-4 py-2 text-right font-medium text-muted-foreground">Stock</th>
                                            <th className="px-4 py-2 text-right font-medium text-muted-foreground">Mínimo</th>
                                            <th className="px-4 py-2"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {alertas_stock.map((alerta) => (
                                            <tr key={alerta.sku} className="hover:bg-muted/30">
                                                <td className="px-4 py-2">
                                                    <div className="font-medium">{alerta.name}</div>
                                                    <div className="font-mono text-xs text-muted-foreground">{alerta.sku}</div>
                                                </td>
                                                <td className="px-4 py-2 text-right tabular-nums font-medium text-destructive">
                                                    {alerta.stock}
                                                </td>
                                                <td className="px-4 py-2 text-right tabular-nums text-muted-foreground">{alerta.min_stock}</td>
                                                <td className="px-4 py-2">
                                                    {alerta.stock === 0 && (
                                                        <Badge variant="destructive" className="text-xs">
                                                            Crítico
                                                        </Badge>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [{ title: 'Dashboard', href: dashboard() }],
};
