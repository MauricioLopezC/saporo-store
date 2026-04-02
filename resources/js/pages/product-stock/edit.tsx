import { Head, Link } from '@inertiajs/react';
import { Form } from '@inertiajs/react';
import ProductStockController, { index as stockIndex } from '@/actions/App/Http/Controllers/ProductStockController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ProductStock {
    id: number;
    stock: number;
    min_stock: number;
    product: { id: number; name: string; sku: string };
    branch: { id: number; name: string };
}

export default function ProductStockEdit({ stock }: { stock: ProductStock }) {
    return (
        <>
            <Head title={`Editar stock — ${stock.product.name}`} />

            <div className="space-y-6 p-6">
                <Heading
                    title="Editar stock"
                    description={`${stock.product.name} · ${stock.branch.name}`}
                />

                <Form
                    {...ProductStockController.update.form(stock.id)}
                    className="max-w-lg space-y-5"
                >
                    {({ errors, processing }) => (
                        <>
                            <div className="grid gap-2">
                                <Label>Producto</Label>
                                <p className="rounded-md border border-input bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
                                    [{stock.product.sku}] {stock.product.name}
                                </p>
                            </div>

                            <div className="grid gap-2">
                                <Label>Sucursal</Label>
                                <p className="rounded-md border border-input bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
                                    {stock.branch.name}
                                </p>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="stock">Stock actual</Label>
                                <Input
                                    id="stock"
                                    name="stock"
                                    type="number"
                                    min="0"
                                    defaultValue={stock.stock}
                                    required
                                />
                                <InputError message={errors.stock} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="min_stock">Stock mínimo</Label>
                                <Input
                                    id="min_stock"
                                    name="min_stock"
                                    type="number"
                                    min="0"
                                    defaultValue={stock.min_stock}
                                    required
                                />
                                <InputError message={errors.min_stock} />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Guardando...' : 'Guardar cambios'}
                                </Button>
                                <Button variant="outline" asChild>
                                    <Link href={stockIndex.url()}>Cancelar</Link>
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}

ProductStockEdit.layout = {
    breadcrumbs: [
        { title: 'Inventario', href: stockIndex.url() },
        { title: 'Editar stock', href: '#' },
    ],
};
