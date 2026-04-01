import { Head, Link, router, usePage } from '@inertiajs/react';
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon } from 'lucide-react';
import CustomerController from '@/actions/App/Http/Controllers/CustomerController';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { index as customersIndex } from '@/actions/App/Http/Controllers/CustomerController';

interface Customer {
    id: number;
    name: string;
    email: string;
    phone: string;
    address: string | null;
    is_active: boolean;
    created_at: string;
}

interface PaginatedCustomers {
    data: Customer[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

export default function CustomersIndex({ customers }: { customers: PaginatedCustomers }) {
    const { flash } = usePage().props;

    function handleDelete(customer: Customer) {
        if (confirm(`¿Eliminar al cliente "${customer.name}"?`)) {
            router.delete(CustomerController.destroy.url(customer));
        }
    }

    return (
        <>
            <Head title="Clientes" />

            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight">Clientes</h1>
                        <p className="text-sm text-muted-foreground">
                            {customers.total} cliente{customers.total !== 1 ? 's' : ''} registrado{customers.total !== 1 ? 's' : ''}
                        </p>
                    </div>
                    <Button asChild>
                        <Link href={CustomerController.create.url()}>
                            <PlusIcon />
                            Nuevo cliente
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
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Email</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Teléfono</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Estado</th>
                                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {customers.data.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                                        No hay clientes registrados.
                                    </td>
                                </tr>
                            )}
                            {customers.data.map((customer) => (
                                <tr key={customer.id} className="hover:bg-muted/30">
                                    <td className="px-4 py-3 font-medium">{customer.name}</td>
                                    <td className="px-4 py-3 text-muted-foreground">{customer.email}</td>
                                    <td className="px-4 py-3 text-muted-foreground">{customer.phone}</td>
                                    <td className="px-4 py-3">
                                        <Badge variant={customer.is_active ? 'default' : 'secondary'}>
                                            {customer.is_active ? 'Activo' : 'Inactivo'}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button variant="ghost" size="icon" asChild>
                                                <Link href={CustomerController.show.url(customer)}>
                                                    <EyeIcon />
                                                    <span className="sr-only">Ver</span>
                                                </Link>
                                            </Button>
                                            <Button variant="ghost" size="icon" asChild>
                                                <Link href={CustomerController.edit.url(customer)}>
                                                    <PencilIcon />
                                                    <span className="sr-only">Editar</span>
                                                </Link>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-destructive hover:text-destructive"
                                                onClick={() => handleDelete(customer)}
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

                {customers.last_page > 1 && (
                    <div className="flex items-center justify-center gap-1">
                        {customers.links.map((link, i) => (
                            <Button
                                key={i}
                                variant={link.active ? 'default' : 'outline'}
                                size="sm"
                                disabled={!link.url}
                                asChild={!!link.url && !link.active}
                                onClick={link.url && !link.active ? undefined : undefined}
                            >
                                {link.url && !link.active ? (
                                    <Link
                                        href={link.url}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
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

CustomersIndex.layout = {
    breadcrumbs: [
        { title: 'Clientes', href: customersIndex.url() },
    ],
};
