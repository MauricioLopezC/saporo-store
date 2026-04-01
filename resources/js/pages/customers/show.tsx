import { Head, Link, router } from '@inertiajs/react';
import { PencilIcon, TrashIcon, ArrowLeftIcon } from 'lucide-react';
import CustomerController, { index as customersIndex } from '@/actions/App/Http/Controllers/CustomerController';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Customer {
    id: number;
    name: string;
    email: string;
    phone: string;
    address: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export default function CustomersShow({ customer }: { customer: Customer }) {
    function handleDelete() {
        if (confirm(`¿Eliminar al cliente "${customer.name}"?`)) {
            router.delete(CustomerController.destroy.url(customer));
        }
    }

    return (
        <>
            <Head title={customer.name} />

            <div className="space-y-6 p-6">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href={customersIndex.url()}>
                                <ArrowLeftIcon />
                                <span className="sr-only">Volver</span>
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-xl font-semibold tracking-tight">{customer.name}</h1>
                            <Badge
                                variant={customer.is_active ? 'default' : 'secondary'}
                                className="mt-1"
                            >
                                {customer.is_active ? 'Activo' : 'Inactivo'}
                            </Badge>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <Link href={CustomerController.edit.url(customer)}>
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

                <div className="max-w-lg rounded-md border divide-y">
                    <Row label="Nombre" value={customer.name} />
                    <Row label="Correo electrónico" value={customer.email} />
                    <Row label="Teléfono" value={customer.phone} />
                    <Row label="Dirección" value={customer.address ?? '—'} />
                    <Row
                        label="Registrado el"
                        value={new Date(customer.created_at).toLocaleDateString('es', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                        })}
                    />
                </div>
            </div>
        </>
    );
}

function Row({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-baseline gap-4 px-4 py-3">
            <span className="w-40 shrink-0 text-sm text-muted-foreground">{label}</span>
            <span className="text-sm font-medium">{value}</span>
        </div>
    );
}

CustomersShow.layout = {
    breadcrumbs: [
        { title: 'Clientes', href: customersIndex.url() },
        { title: 'Detalle', href: '#' },
    ],
};
