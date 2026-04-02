import { Head, Link, useForm } from '@inertiajs/react';
import SaleController, { index as salesIndex } from '@/actions/App/Http/Controllers/SaleController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
    items: SaleItem[];
}

interface StatusOption {
    value: string;
    label: string;
}

export default function SalesEdit({ sale, statuses }: { sale: Sale; statuses: StatusOption[] }) {
    const { data, setData, put, processing, errors } = useForm({
        status: sale.status,
        discount: parseFloat(sale.discount),
        tax: parseFloat(sale.tax),
        notes: sale.notes ?? '',
    });

    const total = parseFloat(sale.subtotal) - data.discount + data.tax;

    function submit(e: React.FormEvent) {
        e.preventDefault();
        put(SaleController.update.url(sale));
    }

    const selectClass = 'rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 w-full';

    return (
        <>
            <Head title={`Editar — ${sale.sale_number}`} />

            <div className="space-y-6 p-6">
                <Heading
                    title="Editar venta"
                    description={`Modificando ${sale.sale_number}`}
                />

                <form onSubmit={submit} className="max-w-2xl space-y-6">
                    <div className="grid gap-5 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="status">Estado</Label>
                            <select
                                id="status"
                                value={data.status}
                                onChange={(e) => setData('status', e.target.value)}
                                className={selectClass}
                            >
                                {statuses.map((s) => (
                                    <option key={s.value} value={s.value}>{s.label}</option>
                                ))}
                            </select>
                            <InputError message={errors.status} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="notes">Notas</Label>
                            <Input
                                id="notes"
                                value={data.notes}
                                onChange={(e) => setData('notes', e.target.value)}
                                placeholder="Opcional"
                            />
                            <InputError message={errors.notes} />
                        </div>
                    </div>

                    {/* Ítems (solo lectura) */}
                    <div className="space-y-2">
                        <Label>Ítems</Label>
                        <div className="rounded-md border">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-muted/50">
                                        <th className="px-4 py-2 text-left font-medium text-muted-foreground">SKU</th>
                                        <th className="px-4 py-2 text-left font-medium text-muted-foreground">Producto</th>
                                        <th className="px-4 py-2 text-right font-medium text-muted-foreground">Cantidad</th>
                                        <th className="px-4 py-2 text-right font-medium text-muted-foreground">Precio unit.</th>
                                        <th className="px-4 py-2 text-right font-medium text-muted-foreground">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {sale.items.map((item) => (
                                        <tr key={item.id}>
                                            <td className="px-4 py-2 font-mono text-xs text-muted-foreground">{item.product.sku}</td>
                                            <td className="px-4 py-2">{item.product.name}</td>
                                            <td className="px-4 py-2 text-right tabular-nums">{Number(item.quantity).toLocaleString('es')}</td>
                                            <td className="px-4 py-2 text-right tabular-nums">${Number(item.unit_price).toFixed(2)}</td>
                                            <td className="px-4 py-2 text-right tabular-nums font-medium">${Number(item.subtotal).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Totales editables */}
                    <div className="ml-auto max-w-xs space-y-2 rounded-md border p-4">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Subtotal</span>
                            <span className="tabular-nums">${Number(sale.subtotal).toFixed(2)}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="w-24 shrink-0 text-sm text-muted-foreground">Descuento</span>
                            <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={data.discount}
                                onChange={(e) => setData('discount', parseFloat(e.target.value) || 0)}
                                className="h-7 text-right text-sm"
                            />
                        </div>
                        <InputError message={errors.discount} />
                        <div className="flex items-center gap-3">
                            <span className="w-24 shrink-0 text-sm text-muted-foreground">Impuesto</span>
                            <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={data.tax}
                                onChange={(e) => setData('tax', parseFloat(e.target.value) || 0)}
                                className="h-7 text-right text-sm"
                            />
                        </div>
                        <InputError message={errors.tax} />
                        <div className="flex justify-between border-t pt-2 text-sm font-semibold">
                            <span>Total</span>
                            <span className="tabular-nums">${total.toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Guardando...' : 'Guardar cambios'}
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href={salesIndex.url()}>Cancelar</Link>
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}

SalesEdit.layout = {
    breadcrumbs: [
        { title: 'Ventas', href: salesIndex.url() },
        { title: 'Editar venta', href: '#' },
    ],
};
