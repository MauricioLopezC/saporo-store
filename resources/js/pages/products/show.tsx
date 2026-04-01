import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeftIcon, PencilIcon, TrashIcon } from 'lucide-react';
import ProductController, { index as productsIndex } from '@/actions/App/Http/Controllers/ProductController';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Product {
    id: number;
    sku: string;
    barcode: string | null;
    name: string;
    description: string | null;
    price: string;
    cost: string | null;
    unit: string;
    is_active: boolean;
    created_at: string;
    category: { id: number; name: string } | null;
    supplier: { id: number; name: string } | null;
}

export default function ProductsShow({ product }: { product: Product }) {
    function handleDelete() {
        if (confirm(`¿Eliminar el producto "${product.name}"?`)) {
            router.delete(ProductController.destroy.url(product));
        }
    }

    return (
        <>
            <Head title={product.name} />

            <div className="space-y-6 p-6">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href={productsIndex.url()}>
                                <ArrowLeftIcon />
                                <span className="sr-only">Volver</span>
                            </Link>
                        </Button>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl font-semibold tracking-tight">{product.name}</h1>
                                <Badge variant={product.is_active ? 'default' : 'secondary'}>
                                    {product.is_active ? 'Activo' : 'Inactivo'}
                                </Badge>
                            </div>
                            <p className="font-mono text-xs text-muted-foreground">{product.sku}</p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <Link href={ProductController.edit.url(product)}>
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

                <div className="grid max-w-2xl gap-6 md:grid-cols-2">
                    <div className="rounded-md border divide-y">
                        <SectionTitle>Información general</SectionTitle>
                        <Row label="SKU" value={product.sku} />
                        <Row label="Código de barras" value={product.barcode ?? '—'} />
                        <Row label="Nombre" value={product.name} />
                        <Row label="Descripción" value={product.description ?? '—'} />
                        <Row label="Unidad" value={product.unit} />
                        <Row label="Categoría" value={product.category?.name ?? '—'} />
                        <Row label="Proveedor" value={product.supplier?.name ?? '—'} />
                    </div>

                    <div className="rounded-md border divide-y">
                        <SectionTitle>Precios</SectionTitle>
                        <Row
                            label="Precio de venta"
                            value={`$${Number(product.price).toFixed(2)}`}
                        />
                        <Row
                            label="Costo"
                            value={product.cost ? `$${Number(product.cost).toFixed(2)}` : '—'}
                        />
                        {product.cost && (
                            <Row
                                label="Margen"
                                value={`${(((Number(product.price) - Number(product.cost)) / Number(product.cost)) * 100).toFixed(1)}%`}
                            />
                        )}
                        <Row
                            label="Registrado el"
                            value={new Date(product.created_at).toLocaleDateString('es', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                            })}
                        />
                    </div>
                </div>
            </div>
        </>
    );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
    return (
        <div className="bg-muted/50 px-4 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {children}
        </div>
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

ProductsShow.layout = {
    breadcrumbs: [
        { title: 'Productos', href: productsIndex.url() },
        { title: 'Detalle', href: '#' },
    ],
};
