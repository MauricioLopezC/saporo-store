import { Head, Link, router, usePage } from '@inertiajs/react';
import { PlusIcon, PencilIcon, TrashIcon } from 'lucide-react';
import SupplierController from '@/actions/App/Http/Controllers/SupplierController';
import { index as suppliersIndex } from '@/actions/App/Http/Controllers/SupplierController';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Supplier {
    id: number;
    name: string;
    contact_name: string | null;
    email: string | null;
    phone: string | null;
    is_active: boolean;
}

interface PaginatedSuppliers {
    data: Supplier[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

export default function SuppliersIndex({ suppliers }: { suppliers: PaginatedSuppliers }) {
    const { flash } = usePage().props;

    function handleDelete(supplier: Supplier) {
        if (confirm(`¿Eliminar el proveedor "${supplier.name}"?`)) {
            router.delete(SupplierController.destroy.url(supplier));
        }
    }

    return (
        <>
            <Head title="Proveedores" />

            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight">Proveedores</h1>
                        <p className="text-sm text-muted-foreground">
                            {suppliers.total} proveedor{suppliers.total !== 1 ? 'es' : ''} registrado{suppliers.total !== 1 ? 's' : ''}
                        </p>
                    </div>
                    <Button asChild>
                        <Link href={SupplierController.create.url()}>
                            <PlusIcon />
                            Nuevo proveedor
                        </Link>
                    </Button>
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
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Nombre</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Contacto</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Email</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Teléfono</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Estado</th>
                                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {suppliers.data.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                                        No hay proveedores registrados.
                                    </td>
                                </tr>
                            )}
                            {suppliers.data.map((supplier) => (
                                <tr key={supplier.id} className="hover:bg-muted/30">
                                    <td className="px-4 py-3 font-medium">{supplier.name}</td>
                                    <td className="px-4 py-3 text-muted-foreground">{supplier.contact_name ?? '—'}</td>
                                    <td className="px-4 py-3 text-muted-foreground">{supplier.email ?? '—'}</td>
                                    <td className="px-4 py-3 text-muted-foreground">{supplier.phone ?? '—'}</td>
                                    <td className="px-4 py-3">
                                        <Badge variant={supplier.is_active ? 'default' : 'secondary'}>
                                            {supplier.is_active ? 'Activo' : 'Inactivo'}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button variant="ghost" size="icon" asChild>
                                                <Link href={SupplierController.edit.url(supplier)}>
                                                    <PencilIcon />
                                                    <span className="sr-only">Editar</span>
                                                </Link>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-destructive hover:text-destructive"
                                                onClick={() => handleDelete(supplier)}
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

                {suppliers.last_page > 1 && (
                    <div className="flex items-center justify-center gap-1">
                        {suppliers.links.map((link, i) => (
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

SuppliersIndex.layout = {
    breadcrumbs: [
        { title: 'Proveedores', href: suppliersIndex.url() },
    ],
};
