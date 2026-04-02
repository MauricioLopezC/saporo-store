import { Head, Link, router, usePage } from '@inertiajs/react';
import { PlusIcon, PencilIcon } from 'lucide-react';
import ProductStockController from '@/actions/App/Http/Controllers/ProductStockController';
import { index as stockIndex } from '@/actions/App/Http/Controllers/ProductStockController';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ProductStock {
    id: number;
    stock: number;
    min_stock: number;
    product: { id: number; name: string; sku: string };
    branch: { id: number; name: string };
}

interface Branch {
    id: number;
    name: string;
}

interface PaginatedStocks {
    data: ProductStock[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

export default function ProductStockIndex({
    stocks,
    branches,
    filters,
}: {
    stocks: PaginatedStocks;
    branches: Branch[];
    filters: { branch_id?: string; low_stock?: string };
}) {
    const { flash } = usePage().props;

    function handleFilter(key: string, value: string) {
        router.get(stockIndex.url(), { ...filters, [key]: value || undefined }, { preserveState: true, replace: true });
    }

    return (
        <>
            <Head title="Inventario" />

            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight">Inventario</h1>
                        <p className="text-sm text-muted-foreground">
                            {stocks.total} registro{stocks.total !== 1 ? 's' : ''} de stock
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <select
                            value={filters.branch_id ?? ''}
                            onChange={(e) => handleFilter('branch_id', e.target.value)}
                            className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        >
                            <option value="">Todas las sucursales</option>
                            {branches.map((branch) => (
                                <option key={branch.id} value={branch.id}>
                                    {branch.name}
                                </option>
                            ))}
                        </select>
                        <Button
                            variant={filters.low_stock ? 'destructive' : 'outline'}
                            size="sm"
                            onClick={() => handleFilter('low_stock', filters.low_stock ? '' : '1')}
                        >
                            Stock bajo
                        </Button>
                        <Button asChild>
                            <Link href={ProductStockController.create.url()}>
                                <PlusIcon />
                                Nuevo stock
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
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">SKU</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Producto</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Sucursal</th>
                                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Stock</th>
                                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Stock mínimo</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Alerta</th>
                                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {stocks.data.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                                        No hay registros de stock.
                                    </td>
                                </tr>
                            )}
                            {stocks.data.map((item) => (
                                <tr key={item.id} className="hover:bg-muted/30">
                                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{item.product.sku}</td>
                                    <td className="px-4 py-3 font-medium">{item.product.name}</td>
                                    <td className="px-4 py-3 text-muted-foreground">{item.branch.name}</td>
                                    <td className="px-4 py-3 text-right tabular-nums">{item.stock}</td>
                                    <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">{item.min_stock}</td>
                                    <td className="px-4 py-3">
                                        {item.stock <= item.min_stock && (
                                            <Badge variant="destructive">Stock bajo</Badge>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button variant="ghost" size="icon" asChild>
                                                <Link href={ProductStockController.edit.url(item.id)}>
                                                    <PencilIcon />
                                                    <span className="sr-only">Editar</span>
                                                </Link>
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {stocks.last_page > 1 && (
                    <div className="flex items-center justify-center gap-1">
                        {stocks.links.map((link, i) => (
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

ProductStockIndex.layout = {
    breadcrumbs: [
        { title: 'Inventario', href: stockIndex.url() },
    ],
};
