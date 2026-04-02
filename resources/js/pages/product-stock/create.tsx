import { Head, Link } from '@inertiajs/react';
import { Form } from '@inertiajs/react';
import ProductStockController, { index as stockIndex } from '@/actions/App/Http/Controllers/ProductStockController';
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

export default function ProductStockCreate({
    products,
    branches,
}: {
    products: Product[];
    branches: Branch[];
}) {
    return (
        <>
            <Head title="Nuevo stock" />

            <div className="space-y-6 p-6">
                <Heading title="Nuevo registro de stock" description="Asigna stock inicial a un producto en una sucursal" />

                <Form
                    {...ProductStockController.store.form()}
                    className="max-w-lg space-y-5"
                >
                    {({ errors, processing }) => (
                        <>
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
                                <Label htmlFor="stock">Stock actual</Label>
                                <Input
                                    id="stock"
                                    name="stock"
                                    type="number"
                                    min="0"
                                    defaultValue="0"
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
                                    defaultValue="0"
                                    required
                                />
                                <InputError message={errors.min_stock} />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Guardando...' : 'Registrar stock'}
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

ProductStockCreate.layout = {
    breadcrumbs: [
        { title: 'Inventario', href: stockIndex.url() },
        { title: 'Nuevo stock', href: ProductStockController.create.url() },
    ],
};
