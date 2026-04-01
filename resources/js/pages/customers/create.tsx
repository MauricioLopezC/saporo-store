import { Head, Link } from '@inertiajs/react';
import { Form } from '@inertiajs/react';
import CustomerController, { index as customersIndex } from '@/actions/App/Http/Controllers/CustomerController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function CustomersCreate() {
    return (
        <>
            <Head title="Nuevo cliente" />

            <div className="space-y-6 p-6">
                <Heading title="Nuevo cliente" description="Registra un nuevo cliente de la ferretería" />

                <Form
                    {...CustomerController.store.form()}
                    className="max-w-lg space-y-5"
                >
                    {({ errors, processing }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="name">Nombre completo</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    autoComplete="off"
                                    placeholder="Ej: Juan Pérez"
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
                                    autoComplete="off"
                                    placeholder="juan@ejemplo.com"
                                    required
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="phone">Teléfono</Label>
                                <Input
                                    id="phone"
                                    name="phone"
                                    placeholder="Ej: +1 555 0100"
                                    required
                                />
                                <InputError message={errors.phone} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="address">Dirección</Label>
                                <Input
                                    id="address"
                                    name="address"
                                    placeholder="Opcional"
                                />
                                <InputError message={errors.address} />
                            </div>

                            <div className="flex items-center gap-2">
                                <Checkbox id="is_active" name="is_active" defaultChecked value="1" />
                                <Label htmlFor="is_active">Cliente activo</Label>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Guardando...' : 'Registrar cliente'}
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

CustomersCreate.layout = {
    breadcrumbs: [
        { title: 'Clientes', href: customersIndex.url() },
        { title: 'Nuevo cliente', href: CustomerController.create.url() },
    ],
};
