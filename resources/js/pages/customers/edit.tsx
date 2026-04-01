import { Head, Link } from '@inertiajs/react';
import { Form } from '@inertiajs/react';
import CustomerController, { index as customersIndex } from '@/actions/App/Http/Controllers/CustomerController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Customer {
    id: number;
    name: string;
    email: string;
    phone: string;
    address: string | null;
    is_active: boolean;
}

export default function CustomersEdit({ customer }: { customer: Customer }) {
    return (
        <>
            <Head title={`Editar — ${customer.name}`} />

            <div className="space-y-6 p-6">
                <Heading
                    title="Editar cliente"
                    description={`Modificando los datos de ${customer.name}`}
                />

                <Form
                    {...CustomerController.update.form(customer)}
                    className="max-w-lg space-y-5"
                >
                    {({ errors, processing }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="name">Nombre completo</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    defaultValue={customer.name}
                                    required
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email">Correo electrónico</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    defaultValue={customer.email}
                                    required
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="phone">Teléfono</Label>
                                <Input
                                    id="phone"
                                    name="phone"
                                    defaultValue={customer.phone}
                                    required
                                />
                                <InputError message={errors.phone} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="address">Dirección</Label>
                                <Input
                                    id="address"
                                    name="address"
                                    defaultValue={customer.address ?? ''}
                                    placeholder="Opcional"
                                />
                                <InputError message={errors.address} />
                            </div>

                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="is_active"
                                    name="is_active"
                                    defaultChecked={customer.is_active}
                                    value="1"
                                />
                                <Label htmlFor="is_active">Cliente activo</Label>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Guardando...' : 'Guardar cambios'}
                                </Button>
                                <Button variant="outline" asChild>
                                    <Link href={customersIndex.url()}>Cancelar</Link>
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}

CustomersEdit.layout = {
    breadcrumbs: [
        { title: 'Clientes', href: customersIndex.url() },
        { title: 'Editar cliente', href: '#' },
    ],
};
