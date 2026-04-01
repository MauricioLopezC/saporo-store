import { Head, Link, router, usePage } from '@inertiajs/react';
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon } from 'lucide-react';
import ProductController, { index as productsIndex } from '@/actions/App/Http/Controllers/ProductController';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Product {
    id: number;
    sku: string;
    name: string;
    price: string;
    unit: string;
    is_active: boolean;
    category: { id: number; name: string } | null;
    supplier: { id: number; name: string } | null;
}

interface PaginatedProducts {
    data: Product[];
    current_page: number;
    last_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

export default function ProductsIndex({ products }: { products: PaginatedProducts }) {
    const { flash } = usePage().props;

    function handleDelete(product: Product) {
        if (confirm(`¿Eliminar el producto "${product.name}"?`)) {
            router.delete(ProductController.destroy.url(product));
        }
    }

    return (
        <>
            <Head title="Productos" />

            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight">Productos</h1>
                        <p className="text-sm text-muted-foreground">
                            {products.total} producto{products.total !== 1 ? 's' : ''}
                        </p>
                    </div>
                    <Button asChild>
                        <Link href={ProductController.create.url()}>
                            <PlusIcon />
                            Nuevo producto
                        </Link>
                    </Button>
                </div>

                {flash.success && (
                    <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-800/30 dark:bg-green-900/20 dark:text-green-400">
                        {flash.success}
                    </div>
                )}

                <div className="rounded-md border">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b bg-muted/50">
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">SKU</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Nombre</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Categoría</th>
                                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Precio</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Unidad</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Estado</th>
                                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {products.data.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                                        No hay productos registrados.
                                    </td>
                                </tr>
                            )}
                            {products.data.map((product) => (
                                <tr key={product.id} className="hover:bg-muted/30">
                                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{product.sku}</td>
                                    <td className="px-4 py-3 font-medium">{product.name}</td>
                                    <td className="px-4 py-3 text-muted-foreground">
                                        {product.category?.name ?? <span className="italic">—</span>}
                                    </td>
                                    <td className="px-4 py-3 text-right tabular-nums">
                                        ${Number(product.price).toFixed(2)}
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground">{product.unit}</td>
                                    <td className="px-4 py-3">
                                        <Badge variant={product.is_active ? 'default' : 'secondary'}>
                                            {product.is_active ? 'Activo' : 'Inactivo'}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button variant="ghost" size="icon" asChild>
                                                <Link href={ProductController.show.url(product)}>
                                                    <EyeIcon />
                                                    <span className="sr-only">Ver</span>
                                                </Link>
                                            </Button>
                                            <Button variant="ghost" size="icon" asChild>
                                                <Link href={ProductController.edit.url(product)}>
                                                    <PencilIcon />
                                                    <span className="sr-only">Editar</span>
                                                </Link>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-destructive hover:text-destructive"
                                                onClick={() => handleDelete(product)}
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

                {products.last_page > 1 && (
                    <div className="flex items-center justify-center gap-1">
                        {products.links.map((link, i) => (
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

ProductsIndex.layout = {
    breadcrumbs: [{ title: 'Productos', href: productsIndex.url() }],
};
