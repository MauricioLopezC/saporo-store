import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeftIcon, PencilIcon, TrashIcon } from 'lucide-react';
import SaleController, { index as salesIndex } from '@/actions/App/Http/Controllers/SaleController';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface SaleItem {
    id: number;
    quantity: string;
    unit_price: string;
    discount: string;
    subtotal: string;
    product: { id: number; name: string; sku: string };
}

interface Sale {
    id: number;
    sale_number: string;
    status: string;
    subtotal: string;
    discount: string;
    tax: string;
    total: string;
    notes: string | null;
    created_at: string;
    branch: { id: number; name: string } | null;
    customer: { id: number; name: string } | null;
    user: { id: number; name: string } | null;
    items: SaleItem[];
}

const statusVariant: Record<string, 'default' | 'secondary' | 'destructive'> = {
    COMPLETED: 'default',
    PENDING: 'secondary',
    CANCELLED: 'destructive',
};

const statusLabel: Record<string, string> = {
    COMPLETED: 'Completada',
    PENDING: 'Pendiente',
    CANCELLED: 'Cancelada',
};

export default function SalesShow({ sale }: { sale: Sale }) {
    function handleDelete() {
        if (confirm(`¿Eliminar la venta "${sale.sale_number}"?`)) {
            router.delete(SaleController.destroy.url(sale));
        }
    }

    return (
        <>
            <Head title={sale.sale_number} />

            <div className="space-y-6 p-6">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href={salesIndex.url()}>
                                <ArrowLeftIcon />
                                <span className="sr-only">Volver</span>
                            </Link>
                        </Button>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="font-mono text-xl font-semibold tracking-tight">{sale.sale_number}</h1>
                                <Badge variant={statusVariant[sale.status] ?? 'secondary'}>
                                    {statusLabel[sale.status] ?? sale.status}
                                </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {new Date(sale.created_at).toLocaleDateString('es', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <Link href={SaleController.edit.url(sale)}>
                                <PencilIcon />
                                Editar
                            </Link>
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            <TrashIcon />
                            Eliminar
                        </Button>
                    </div>
                </div>

                <div className="grid max-w-3xl gap-4 md:grid-cols-2">
                    <div className="divide-y rounded-md border">
                        <div className="bg-muted/50 px-4 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            Información
                        </div>
                        <Row label="Sucursal" value={sale.branch?.name ?? '—'} />
                        <Row label="Cliente" value={sale.customer?.name ?? 'Consumidor final'} />
                        <Row label="Vendedor" value={sale.user?.name ?? '—'} />
                        {sale.notes && <Row label="Notas" value={sale.notes} />}
                    </div>

                    <div className="divide-y rounded-md border">
                        <div className="bg-muted/50 px-4 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            Totales
                        </div>
                        <Row label="Subtotal" value={`$${Number(sale.subtotal).toFixed(2)}`} />
                        <Row label="Descuento" value={`-$${Number(sale.discount).toFixed(2)}`} />
                        <Row label="Impuesto" value={`$${Number(sale.tax).toFixed(2)}`} />
                        <div className="flex items-baseline gap-4 px-4 py-3">
                            <span className="w-36 shrink-0 text-sm font-medium text-muted-foreground">Total</span>
                            <span className="text-base font-semibold">${Number(sale.total).toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                <div className="max-w-3xl rounded-md border">
                    <div className="bg-muted/50 px-4 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Ítems ({sale.items.length})
                    </div>
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b">
                                <th className="px-4 py-2 text-left font-medium text-muted-foreground">SKU</th>
                                <th className="px-4 py-2 text-left font-medium text-muted-foreground">Producto</th>
                                <th className="px-4 py-2 text-right font-medium text-muted-foreground">Cantidad</th>
                                <th className="px-4 py-2 text-right font-medium text-muted-foreground">Precio unit.</th>
                                <th className="px-4 py-2 text-right font-medium text-muted-foreground">Descuento</th>
                                <th className="px-4 py-2 text-right font-medium text-muted-foreground">Subtotal</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {sale.items.map((item) => (
                                <tr key={item.id}>
                                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{item.product.sku}</td>
                                    <td className="px-4 py-3">{item.product.name}</td>
                                    <td className="px-4 py-3 text-right tabular-nums">{Number(item.quantity).toLocaleString('es')}</td>
                                    <td className="px-4 py-3 text-right tabular-nums">${Number(item.unit_price).toFixed(2)}</td>
                                    <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                                        {Number(item.discount) > 0 ? `-$${Number(item.discount).toFixed(2)}` : '—'}
                                    </td>
                                    <td className="px-4 py-3 text-right tabular-nums font-medium">${Number(item.subtotal).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}

function Row({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-baseline gap-4 px-4 py-3">
            <span className="w-36 shrink-0 text-sm text-muted-foreground">{label}</span>
            <span className="text-sm font-medium">{value}</span>
        </div>
    );
}

SalesShow.layout = {
    breadcrumbs: [
        { title: 'Ventas', href: salesIndex.url() },
        { title: 'Detalle', href: '#' },
    ],
};
