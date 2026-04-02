import { Head, Link, router, usePage } from '@inertiajs/react';
import { PlusIcon, EyeIcon, TrashIcon } from 'lucide-react';
import SaleController from '@/actions/App/Http/Controllers/SaleController';
import { index as salesIndex } from '@/actions/App/Http/Controllers/SaleController';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Sale {
    id: number;
    sale_number: string;
    status: string;
    subtotal: string;
    discount: string;
    tax: string;
    total: string;
    created_at: string;
    branch: { id: number; name: string } | null;
    customer: { id: number; name: string } | null;
    user: { id: number; name: string } | null;
}

interface Branch {
    id: number;
    name: string;
}

interface StatusOption {
    value: string;
    label: string;
}

interface PaginatedSales {
    data: Sale[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

const statusVariant: Record<string, 'default' | 'secondary' | 'destructive'> = {
    COMPLETED: 'default',
    PENDING: 'secondary',
    CANCELLED: 'destructive',
};

export default function SalesIndex({
    sales,
    branches,
    filters,
    statuses,
}: {
    sales: PaginatedSales;
    branches: Branch[];
    filters: { status?: string; branch_id?: string };
    statuses: StatusOption[];
}) {
    const { flash } = usePage().props;

    function handleFilter(key: string, value: string) {
        router.get(salesIndex.url(), { ...filters, [key]: value || undefined }, { preserveState: true, replace: true });
    }

    function handleDelete(sale: Sale) {
        if (confirm(`¿Eliminar la venta "${sale.sale_number}"?`)) {
            router.delete(SaleController.destroy.url(sale));
        }
    }

    return (
        <>
            <Head title="Ventas" />

            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight">Ventas</h1>
                        <p className="text-sm text-muted-foreground">
                            {sales.total} venta{sales.total !== 1 ? 's' : ''} registrada{sales.total !== 1 ? 's' : ''}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <select
                            value={filters.status ?? ''}
                            onChange={(e) => handleFilter('status', e.target.value)}
                            className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        >
                            <option value="">Todos los estados</option>
                            {statuses.map((s) => (
                                <option key={s.value} value={s.value}>{s.label}</option>
                            ))}
                        </select>
                        <select
                            value={filters.branch_id ?? ''}
                            onChange={(e) => handleFilter('branch_id', e.target.value)}
                            className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        >
                            <option value="">Todas las sucursales</option>
                            {branches.map((b) => (
                                <option key={b.id} value={b.id}>{b.name}</option>
                            ))}
                        </select>
                        <Button asChild>
                            <Link href={SaleController.create.url()}>
                                <PlusIcon />
                                Nueva venta
                            </Link>
                        </Button>
                    </div>
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
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">N° Venta</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Sucursal</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Cliente</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Usuario</th>
                                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Total</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Estado</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Fecha</th>
                                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {sales.data.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="px-4 py-10 text-center text-muted-foreground">
                                        No hay ventas registradas.
                                    </td>
                                </tr>
                            )}
                            {sales.data.map((sale) => (
                                <tr key={sale.id} className="hover:bg-muted/30">
                                    <td className="px-4 py-3 font-mono text-xs font-medium">{sale.sale_number}</td>
                                    <td className="px-4 py-3 text-muted-foreground">{sale.branch?.name ?? '—'}</td>
                                    <td className="px-4 py-3 text-muted-foreground">{sale.customer?.name ?? 'Consumidor final'}</td>
                                    <td className="px-4 py-3 text-muted-foreground">{sale.user?.name ?? '—'}</td>
                                    <td className="px-4 py-3 text-right tabular-nums font-medium">
                                        ${Number(sale.total).toFixed(2)}
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge variant={statusVariant[sale.status] ?? 'secondary'}>
                                            {statuses.find((s) => s.value === sale.status)?.label ?? sale.status}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground text-xs">
                                        {new Date(sale.created_at).toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button variant="ghost" size="icon" asChild>
                                                <Link href={SaleController.show.url(sale)}>
                                                    <EyeIcon />
                                                    <span className="sr-only">Ver</span>
                                                </Link>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-destructive hover:text-destructive"
                                                onClick={() => handleDelete(sale)}
                                            >
                                                <TrashIcon />
                                                <span className="sr-only">Eliminar</span>
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {sales.last_page > 1 && (
                    <div className="flex items-center justify-center gap-1">
                        {sales.links.map((link, i) => (
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

SalesIndex.layout = {
    breadcrumbs: [
        { title: 'Ventas', href: salesIndex.url() },
    ],
};
