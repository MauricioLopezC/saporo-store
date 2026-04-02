import { Head, Link } from '@inertiajs/react';
import { Form } from '@inertiajs/react';
import { useState } from 'react';
import StockMovementController, { index as movementsIndex } from '@/actions/App/Http/Controllers/StockMovementController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Product {
    id: number;
    name: string;
    sku: string;
}

interface Branch {
    id: number;
    name: string;
}

interface SelectOption {
    value: string;
    label: string;
}

export default function StockMovementCreate({
    products,
    branches,
    types,
}: {
    products: Product[];
    branches: Branch[];
    types: SelectOption[];
}) {
    const [selectedType, setSelectedType] = useState('');

    const isAdjustment = selectedType === 'ADJUSTMENT';

    return (
        <>
            <Head title="Nuevo movimiento de stock" />

            <div className="space-y-6 p-6">
                <Heading
                    title="Nuevo movimiento de stock"
                    description="Registra una entrada de mercancía o un ajuste manual de inventario"
                />

                <Form
                    {...StockMovementController.store.form()}
                    className="max-w-lg space-y-5"
                >
                    {({ errors, processing }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="type">Tipo de movimiento</Label>
                                <select
                                    id="type"
                                    name="type"
                                    required
                                    value={selectedType}
                                    onChange={(e) => setSelectedType(e.target.value)}
                                    className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                >
                                    <option value="">Selecciona un tipo</option>
                                    {types.map((t) => (
                                        <option key={t.value} value={t.value}>
                                            {t.label}
                                        </option>
                                    ))}
                                </select>
                                <InputError message={errors.type} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="product_id">Producto</Label>
                                <select
                                    id="product_id"
                                    name="product_id"
                                    required
                                    className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                >
                                    <option value="">Selecciona un producto</option>
                                    {products.map((product) => (
                                        <option key={product.id} value={product.id}>
                                            [{product.sku}] {product.name}
                                        </option>
                                    ))}
                                </select>
                                <InputError message={errors.product_id} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="branch_id">Sucursal</Label>
                                <select
                                    id="branch_id"
                                    name="branch_id"
                                    required
                                    className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                >
                                    <option value="">Selecciona una sucursal</option>
                                    {branches.map((branch) => (
                                        <option key={branch.id} value={branch.id}>
                                            {branch.name}
                                        </option>
                                    ))}
                                </select>
                                <InputError message={errors.branch_id} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="quantity">
                                    Cantidad
                                    {isAdjustment && (
                                        <span className="ml-1 text-xs text-muted-foreground">(negativo para reducir stock)</span>
                                    )}
                                </Label>
                                <Input
                                    id="quantity"
                                    name="quantity"
                                    type="number"
                                    step="0.001"
                                    min={isAdjustment ? undefined : '0.001'}
                                    placeholder={isAdjustment ? 'Ej: -5 o 10' : 'Ej: 100'}
                                    required
                                />
                                <InputError message={errors.quantity} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="reason">Motivo</Label>
                                <Input
                                    id="reason"
                                    name="reason"
                                    type="text"
                                    placeholder="Ej: Compra a proveedor, Conteo físico, etc."
                                    maxLength={255}
                                    required
                                />
                                <InputError message={errors.reason} />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Guardando...' : 'Registrar movimiento'}
                                </Button>
                                <Button variant="outline" asChild>
                                    <Link href={movementsIndex.url()}>Cancelar</Link>
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}

StockMovementCreate.layout = {
    breadcrumbs: [
        { title: 'Movimientos de stock', href: movementsIndex.url() },
        { title: 'Nuevo movimiento', href: StockMovementController.create.url() },
    ],
};
