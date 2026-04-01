import { Head, Link, router, usePage } from '@inertiajs/react';
import { PlusIcon, PencilIcon, TrashIcon } from 'lucide-react';
import CategoryController, { index as categoriesIndex } from '@/actions/App/Http/Controllers/CategoryController';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Category {
    id: number;
    name: string;
    description: string | null;
    is_active: boolean;
    products_count: number;
}

interface PaginatedCategories {
    data: Category[];
    current_page: number;
    last_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

export default function CategoriesIndex({ categories }: { categories: PaginatedCategories }) {
    const { flash } = usePage().props;

    function handleDelete(category: Category) {
        if (category.products_count > 0) {
            alert(`No se puede eliminar "${category.name}" porque tiene ${category.products_count} producto(s) asociado(s).`);
            return;
        }
        if (confirm(`¿Eliminar la categoría "${category.name}"?`)) {
            router.delete(CategoryController.destroy.url(category));
        }
    }

    return (
        <>
            <Head title="Categorías" />

            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight">Categorías</h1>
                        <p className="text-sm text-muted-foreground">
                            {categories.total} categoría{categories.total !== 1 ? 's' : ''}
                        </p>
                    </div>
                    <Button asChild>
                        <Link href={CategoryController.create.url()}>
                            <PlusIcon />
                            Nueva categoría
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
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Nombre</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Descripción</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Productos</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Estado</th>
                                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {categories.data.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                                        No hay categorías registradas.
                                    </td>
                                </tr>
                            )}
                            {categories.data.map((category) => (
                                <tr key={category.id} className="hover:bg-muted/30">
                                    <td className="px-4 py-3 font-medium">{category.name}</td>
                                    <td className="px-4 py-3 text-muted-foreground">
                                        {category.description ?? <span className="italic">—</span>}
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground">{category.products_count}</td>
                                    <td className="px-4 py-3">
                                        <Badge variant={category.is_active ? 'default' : 'secondary'}>
                                            {category.is_active ? 'Activa' : 'Inactiva'}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button variant="ghost" size="icon" asChild>
                                                <Link href={CategoryController.edit.url(category)}>
                                                    <PencilIcon />
                                                    <span className="sr-only">Editar</span>
                                                </Link>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-destructive hover:text-destructive"
                                                onClick={() => handleDelete(category)}
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

                {categories.last_page > 1 && (
                    <div className="flex items-center justify-center gap-1">
                        {categories.links.map((link, i) => (
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

CategoriesIndex.layout = {
    breadcrumbs: [{ title: 'Categorías', href: categoriesIndex.url() }],
};
