import { Head, Link } from '@inertiajs/react';
import { Form } from '@inertiajs/react';
import SupplierController, { index as suppliersIndex } from '@/actions/App/Http/Controllers/SupplierController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Supplier {
    id: number;
    name: string;
    contact_name: string | null;
    email: string | null;
    phone: string | null;
    address: string | null;
    is_active: boolean;
}

export default function SuppliersEdit({ supplier }: { supplier: Supplier }) {
    return (
        <>
            <Head title={`Editar — ${supplier.name}`} />

            <div className="space-y-6 p-6">
                <Heading
                    title="Editar proveedor"
                    description={`Modificando los datos de ${supplier.name}`}
                />

                <Form
                    {...SupplierController.update.form(supplier)}
                    className="max-w-lg space-y-5"
                >
                    {({ errors, processing }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="name">Nombre</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    defaultValue={supplier.name}
                                    required
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="contact_name">Nombre de contacto</Label>
                                <Input
                                    id="contact_name"
                                    name="contact_name"
                                    defaultValue={supplier.contact_name ?? ''}
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
                                    defaultValue={supplier.email ?? ''}
                                    placeholder="Opcional"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="phone">Teléfono</Label>
                                <Input
                                    id="phone"
                                    name="phone"
                                    defaultValue={supplier.phone ?? ''}
                                    placeholder="Opcional"
                                />
                                <InputError message={errors.phone} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="address">Dirección</Label>
                                <Input
                                    id="address"
                                    name="address"
                                    defaultValue={supplier.address ?? ''}
                                    placeholder="Opcional"
                                />
                                <InputError message={errors.address} />
                            </div>

                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="is_active"
                                    name="is_active"
                                    defaultChecked={supplier.is_active}
                                    value="1"
                                />
                                <Label htmlFor="is_active">Proveedor activo</Label>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Guardando...' : 'Guardar cambios'}
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

SuppliersEdit.layout = {
    breadcrumbs: [
        { title: 'Proveedores', href: suppliersIndex.url() },
        { title: 'Editar proveedor', href: '#' },
    ],
};
