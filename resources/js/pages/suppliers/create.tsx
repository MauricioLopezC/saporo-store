import { Head, Link } from '@inertiajs/react';
import { Form } from '@inertiajs/react';
import SupplierController, { index as suppliersIndex } from '@/actions/App/Http/Controllers/SupplierController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function SuppliersCreate() {
    return (
        <>
            <Head title="Nuevo proveedor" />

            <div className="space-y-6 p-6">
                <Heading title="Nuevo proveedor" description="Registra un nuevo proveedor" />

                <Form
                    {...SupplierController.store.form()}
                    className="max-w-lg space-y-5"
                >
                    {({ errors, processing }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="name">Nombre</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    autoComplete="off"
                                    placeholder="Ej: Distribuidora ABC"
                                    required
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="contact_name">Nombre de contacto</Label>
                                <Input
                                    id="contact_name"
                                    name="contact_name"
                                    autoComplete="off"
                                    placeholder="Opcional"
                                />
                                <InputError message={errors.contact_name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="off"
                                    placeholder="Opcional"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="phone">Teléfono</Label>
                                <Input
                                    id="phone"
                                    name="phone"
                                    placeholder="Opcional"
                                />
                                <InputError message={errors.phone} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="address">Dirección</Label>
                                <Input
                                    id="address"
                                    name="address"
                                    autoComplete="off"
                                    placeholder="Opcional"
                                />
                                <InputError message={errors.address} />
                            </div>

                            <div className="flex items-center gap-2">
                                <Checkbox id="is_active" name="is_active" defaultChecked value="1" />
                                <Label htmlFor="is_active">Proveedor activo</Label>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Guardando...' : 'Registrar proveedor'}
                                </Button>
                                <Button variant="outline" asChild>
                                    <Link href={suppliersIndex.url()}>Cancelar</Link>
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}

SuppliersCreate.layout = {
    breadcrumbs: [
        { title: 'Proveedores', href: suppliersIndex.url() },
        { title: 'Nuevo proveedor', href: SupplierController.create.url() },
    ],
};
