import { Head, Link, useForm } from '@inertiajs/react';
import { PlusIcon, TrashIcon } from 'lucide-react';
import SaleController, { index as salesIndex } from '@/actions/App/Http/Controllers/SaleController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Product {
    id: number;
    name: string;
    sku: string;
    price: string;
    unit: string;
}

interface Branch {
    id: number;
    name: string;
}

interface Customer {
    id: number;
    name: string;
}

interface SaleItemForm {
    product_id: number | '';
    quantity: number;
    unit_price: number;
    discount: number;
}

const emptyItem = (): SaleItemForm => ({ product_id: '', quantity: 1, unit_price: 0, discount: 0 });

export default function SalesCreate({
    branches,
    customers,
    products,
}: {
    branches: Branch[];
    customers: Customer[];
    products: Product[];
}) {
    const { data, setData, post, processing, errors } = useForm<{
        branch_id: number | '';
        customer_id: number | '';
        status: string;
        discount: number;
        tax: number;
        notes: string;
        items: SaleItemForm[];
    }>({
        branch_id: '',
        customer_id: '',
        status: 'COMPLETED',
        discount: 0,
        tax: 0,
        notes: '',
        items: [emptyItem()],
    });

    const productMap = Object.fromEntries(products.map((p) => [p.id, p]));

    function addItem() {
        setData('items', [...data.items, emptyItem()]);
    }

    function removeItem(index: number) {
        setData('items', data.items.filter((_, i) => i !== index));
    }

    function updateItem(index: number, field: keyof SaleItemForm, value: number | string) {
        const updated = data.items.map((item, i) => {
            if (i !== index) { return item; }
            const next = { ...item, [field]: value };
            if (field === 'product_id' && typeof value === 'number') {
                next.unit_price = parseFloat(productMap[value]?.price ?? '0');
            }
            return next;
        });
        setData('items', updated);
    }

    function itemSubtotal(item: SaleItemForm): number {
        return Math.max(0, (item.unit_price - item.discount) * item.quantity);
    }

    const itemsSubtotal = data.items.reduce((sum, item) => sum + itemSubtotal(item), 0);
    const total = itemsSubtotal - data.discount + data.tax;

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post(SaleController.store.url());
    }

    const selectClass = 'rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 w-full';

    return (
        <>
            <Head title="Nueva venta" />

            <div className="space-y-6 p-6">
                <Heading title="Nueva venta" description="Registra una venta con sus ítems" />

                <form onSubmit={submit} className="max-w-3xl space-y-6">
                    {/* Cabecera */}
                    <div className="grid gap-5 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="branch_id">Sucursal *</Label>
                            <select
                                id="branch_id"
                                value={data.branch_id}
                                onChange={(e) => setData('branch_id', Number(e.target.value))}
                                required
                                className={selectClass}
                            >
                                <option value="">Selecciona una sucursal</option>
                                {branches.map((b) => (
                                    <option key={b.id} value={b.id}>{b.name}</option>
                                ))}
                            </select>
                            <InputError message={errors.branch_id} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="customer_id">Cliente</Label>
                            <select
                                id="customer_id"
                                value={data.customer_id}
                                onChange={(e) => setData('customer_id', e.target.value ? Number(e.target.value) : '')}
                                className={selectClass}
                            >
                                <option value="">Consumidor final</option>
                                {customers.map((c) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                            <InputError message={errors.customer_id} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="status">Estado</Label>
                            <select
                                id="status"
                                value={data.status}
                                onChange={(e) => setData('status', e.target.value)}
                                className={selectClass}
                            >
                                <option value="PENDING">Pendiente</option>
                                <option value="COMPLETED">Completada</option>
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

                    {/* Ítems */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label>Ítems *</Label>
                            <Button type="button" variant="outline" size="sm" onClick={addItem}>
                                <PlusIcon />
                                Agregar ítem
                            </Button>
                        </div>

                        {(errors as any).items && (
                            <p className="text-sm text-destructive">{(errors as any).items}</p>
                        )}

                        <div className="rounded-md border">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-muted/50">
                                        <th className="px-3 py-2 text-left font-medium text-muted-foreground">Producto</th>
                                        <th className="px-3 py-2 text-right font-medium text-muted-foreground w-24">Cantidad</th>
                                        <th className="px-3 py-2 text-right font-medium text-muted-foreground w-28">Precio unit.</th>
                                        <th className="px-3 py-2 text-right font-medium text-muted-foreground w-24">Desc. unit.</th>
                                        <th className="px-3 py-2 text-right font-medium text-muted-foreground w-24">Subtotal</th>
                                        <th className="px-3 py-2 w-10"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {data.items.map((item, index) => (
                                        <tr key={index}>
                                            <td className="px-3 py-2">
                                                <select
                                                    value={item.product_id}
                                                    onChange={(e) => updateItem(index, 'product_id', Number(e.target.value))}
                                                    required
                                                    className={selectClass}
                                                >
                                                    <option value="">Selecciona</option>
                                                    {products.map((p) => (
                                                        <option key={p.id} value={p.id}>
                                                            [{p.sku}] {p.name}
                                                        </option>
                                                    ))}
                                                </select>
                                                <InputError message={(errors as any)[`items.${index}.product_id`]} />
                                            </td>
                                            <td className="px-3 py-2">
                                                <Input
                                                    type="number"
                                                    min="0.001"
                                                    step="0.001"
                                                    value={item.quantity}
                                                    onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                                                    required
                                                    className="text-right"
                                                />
                                                <InputError message={(errors as any)[`items.${index}.quantity`]} />
                                            </td>
                                            <td className="px-3 py-2">
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={item.unit_price}
                                                    onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                                                    required
                                                    className="text-right"
                                                />
                                                <InputError message={(errors as any)[`items.${index}.unit_price`]} />
                                            </td>
                                            <td className="px-3 py-2">
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={item.discount}
                                                    onChange={(e) => updateItem(index, 'discount', parseFloat(e.target.value) || 0)}
                                                    className="text-right"
                                                />
                                            </td>
                                            <td className="px-3 py-2 text-right tabular-nums font-medium">
                                                ${itemSubtotal(item).toFixed(2)}
                                            </td>
                                            <td className="px-3 py-2">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-destructive hover:text-destructive"
                                                    onClick={() => removeItem(index)}
                                                    disabled={data.items.length === 1}
                                                >
                                                    <TrashIcon className="h-4 w-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Totales */}
                    <div className="ml-auto max-w-xs space-y-2 rounded-md border p-4">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Subtotal</span>
                            <span className="tabular-nums">${itemsSubtotal.toFixed(2)}</span>
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
                        <div className="flex justify-between border-t pt-2 text-sm font-semibold">
                            <span>Total</span>
                            <span className="tabular-nums">${total.toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Guardando...' : 'Registrar venta'}
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

SalesCreate.layout = {
    breadcrumbs: [
        { title: 'Ventas', href: salesIndex.url() },
        { title: 'Nueva venta', href: SaleController.create.url() },
    ],
};
