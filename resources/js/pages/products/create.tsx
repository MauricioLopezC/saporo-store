import { Head, Link, useForm } from '@inertiajs/react';
import ProductController, { index as productsIndex } from '@/actions/App/Http/Controllers/ProductController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Option {
    id: number;
    name: string;
}

interface UnitOption {
    value: string;
    label: string;
}

function deriveCategoryPrefix(name: string): string {
    const stripped = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const words = stripped.trim().split(/\s+/);
    if (words.length > 1) {
        return words
            .map((w) => w.replace(/[^a-zA-Z]/g, '')[0] ?? '')
            .join('')
            .toUpperCase()
            .slice(0, 4);
    }
    return stripped.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 4);
}

export default function ProductsCreate({
    categories,
    suppliers,
    units,
    nextProductCount,
}: {
    categories: Option[];
    suppliers: Option[];
    units: UnitOption[];
    nextProductCount: number;
}) {
    const { data, setData, post, processing, errors } = useForm({
        sku: '',
        barcode: '',
        name: '',
        description: '',
        price: '',
        cost: '',
        unit: '',
        category_id: '',
        supplier_id: '',
        is_active: true,
    });

    function handleCategoryChange(categoryId: string) {
        setData('category_id', categoryId);
        if (!data.sku) {
            const category = categories.find((c) => String(c.id) === categoryId);
            if (category) {
                const prefix = deriveCategoryPrefix(category.name);
                const seq = String(nextProductCount).padStart(4, '0');
                setData('sku', `${prefix}-${seq}`);
            }
        }
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post(ProductController.store.url());
    }

    return (
        <>
            <Head title="Nuevo producto" />

            <div className="space-y-6 p-6">
                <Heading title="Nuevo producto" description="Registra un producto en el catálogo" />

                <form onSubmit={submit} className="max-w-2xl space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="sku">SKU *</Label>
                            <Input
                                id="sku"
                                value={data.sku}
                                onChange={(e) => setData('sku', e.target.value)}
                                placeholder="Ej: HERR-001"
                                required
                            />
                            <InputError message={errors.sku} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="barcode">Código de barras</Label>
                            <Input
                                id="barcode"
                                value={data.barcode}
                                onChange={(e) => setData('barcode', e.target.value)}
                                placeholder="Opcional"
                            />
                            <InputError message={errors.barcode} />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="name">Nombre *</Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="Ej: Taladro percutor 750W"
                            required
                        />
                        <InputError message={errors.name} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="description">Descripción</Label>
                        <Input
                            id="description"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            placeholder="Opcional"
                        />
                        <InputError message={errors.description} />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="price">Precio de venta *</Label>
                            <Input
                                id="price"
                                type="number"
                                step="0.01"
                                min="0"
                                value={data.price}
                                onChange={(e) => setData('price', e.target.value)}
                                placeholder="0.00"
                                required
                            />
                            <InputError message={errors.price} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="cost">Costo</Label>
                            <Input
                                id="cost"
                                type="number"
                                step="0.01"
                                min="0"
                                value={data.cost}
                                onChange={(e) => setData('cost', e.target.value)}
                                placeholder="0.00"
                            />
                            <InputError message={errors.cost} />
                        </div>

                        <div className="grid gap-2">
                            <Label>Unidad *</Label>
                            <Select
                                value={data.unit}
                                onValueChange={(v) => setData('unit', v)}
                                required
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Seleccionar unidad" />
                                </SelectTrigger>
                                <SelectContent>
                                    {units.map((u) => (
                                        <SelectItem key={u.value} value={u.value}>
                                            {u.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.unit} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label>Categoría *</Label>
                            <Select
                                value={data.category_id}
                                onValueChange={handleCategoryChange}
                                required
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Seleccionar categoría" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((cat) => (
                                        <SelectItem key={cat.id} value={String(cat.id)}>
                                            {cat.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.category_id} />
                        </div>

                        <div className="grid gap-2">
                            <Label>Proveedor</Label>
                            <Select
                                value={data.supplier_id}
                                onValueChange={(v) => setData('supplier_id', v)}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Sin proveedor" />
                                </SelectTrigger>
                                <SelectContent>
                                    {suppliers.map((sup) => (
                                        <SelectItem key={sup.id} value={String(sup.id)}>
                                            {sup.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.supplier_id} />
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="is_active"
                            checked={data.is_active}
                            onCheckedChange={(checked) => setData('is_active', Boolean(checked))}
                        />
                        <Label htmlFor="is_active">Producto activo</Label>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Guardando...' : 'Crear producto'}
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href={productsIndex.url()}>Cancelar</Link>
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}

ProductsCreate.layout = {
    breadcrumbs: [
        { title: 'Productos', href: productsIndex.url() },
        { title: 'Nuevo producto', href: ProductController.create.url() },
    ],
};
