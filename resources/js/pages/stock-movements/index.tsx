import { Head, Link, router, usePage } from '@inertiajs/react';
import { PlusIcon } from 'lucide-react';
import StockMovementController, { index as movementsIndex } from '@/actions/App/Http/Controllers/StockMovementController';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface StockMovement {
    id: number;
    type: string;
    quantity: string;
    previous_stock: number;
    current_stock: number;
    reason: string | null;
    created_at: string;
    product: { id: number; name: string; sku: string };
    branch: { id: number; name: string };
    user: { id: number; name: string };
}

interface Branch {
    id: number;
    name: string;
}

interface SelectOption {
    value: string;
    label: string;
}

interface PaginatedMovements {
    data: StockMovement[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

const typeVariants: Record<string, 'default' | 'destructive' | 'secondary' | 'outline'> = {
    IN: 'default',
    OUT: 'destructive',
    ADJUSTMENT: 'secondary',
};

const typeLabels: Record<string, string> = {
    IN: 'Entrada',
    OUT: 'Salida',
    ADJUSTMENT: 'Ajuste',
};

export default function StockMovementsIndex({
    movements,
    branches,
    types,
    filters,
}: {
    movements: PaginatedMovements;
    branches: Branch[];
    types: SelectOption[];
    filters: { type?: string; branch_id?: string; date_from?: string; date_to?: string };
}) {
    const { flash } = usePage().props;

    function handleFilter(key: string, value: string) {
        router.get(movementsIndex.url(), { ...filters, [key]: value || undefined }, { preserveState: true, replace: true });
    }

    return (
        <>
            <Head title="Movimientos de stock" />

            <div className="space-y-6 p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight">Movimientos de stock</h1>
                        <p className="text-sm text-muted-foreground">
                            {movements.total} movimiento{movements.total !== 1 ? 's' : ''} registrado{movements.total !== 1 ? 's' : ''}
                        </p>
                    </div>
                    <Button asChild>
                        <Link href={StockMovementController.create.url()}>
                            <PlusIcon />
                            Nuevo movimiento
                        </Link>
                    </Button>
                </div>

                <div className="flex flex-wrap gap-3">
                    <select
                        value={filters.type ?? ''}
                        onChange={(e) => handleFilter('type', e.target.value)}
                        className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    >
                        <option value="">Todos los tipos</option>
                        {types.map((t) => (
                            <option key={t.value} value={t.value}>
                                {t.label}
                            </option>
                        ))}
                    </select>

                    <select
                        value={filters.branch_id ?? ''}
                        onChange={(e) => handleFilter('branch_id', e.target.value)}
                        className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    >
                        <option value="">Todas las sucursales</option>
                        {branches.map((b) => (
                            <option key={b.id} value={b.id}>
                                {b.name}
                            </option>
                        ))}
                    </select>

                    <input
                        type="date"
                        value={filters.date_from ?? ''}
                        onChange={(e) => handleFilter('date_from', e.target.value)}
                        className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    />

                    <input
                        type="date"
                        value={filters.date_to ?? ''}
                        onChange={(e) => handleFilter('date_to', e.target.value)}
                        className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    />
                </div>

                {(flash as any).success && (
                    <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-800/30 dark:bg-green-900/20 dark:text-green-400">
                        {(flash as any).success}
                    </div>
                )}

                <div className="rounded-md border">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b bg-muted/50">
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Fecha</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Producto</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Sucursal</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Tipo</th>
                                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Cantidad</th>
                                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Stock anterior</th>
                                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Stock nuevo</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Motivo</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Usuario</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {movements.data.length === 0 && (
                                <tr>
                                    <td colSpan={9} className="px-4 py-10 text-center text-muted-foreground">
                                        No hay movimientos de stock.
                                    </td>
                                </tr>
                            )}
                            {movements.data.map((movement) => (
                                <tr key={movement.id} className="hover:bg-muted/30">
                                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                                        {new Date(movement.created_at).toLocaleString('es-MX', {
                                            year: 'numeric',
                                            month: '2-digit',
                                            day: '2-digit',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="font-medium">{movement.product.name}</div>
                                        <div className="text-xs text-muted-foreground font-mono">{movement.product.sku}</div>
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground">{movement.branch.name}</td>
                                    <td className="px-4 py-3">
                                        <Badge variant={typeVariants[movement.type] ?? 'outline'}>
                                            {typeLabels[movement.type] ?? movement.type}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3 text-right tabular-nums">{movement.quantity}</td>
                                    <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">{movement.previous_stock}</td>
                                    <td className="px-4 py-3 text-right tabular-nums font-medium">{movement.current_stock}</td>
                                    <td className="px-4 py-3 text-muted-foreground max-w-[200px] truncate">{movement.reason ?? '—'}</td>
                                    <td className="px-4 py-3 text-muted-foreground">{movement.user.name}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {movements.last_page > 1 && (
                    <div className="flex items-center justify-center gap-1">
                        {movements.links.map((link, i) => (
                            <Button
                                key={i}
                                variant={link.active ? 'default' : 'outline'}
                                size="sm"
                                disabled={!link.url}
                                asChild={!!link.url && !link.active}
                            >
                                {link.url && !link.active ? (
                                    <Link href={link.url} dangerouslySetInnerHTML={{ __html: link.label }} />
                                ) : (
                                    <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                )}
                            </Button>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

StockMovementsIndex.layout = {
    breadcrumbs: [{ title: 'Movimientos de stock', href: movementsIndex.url() }],
};
