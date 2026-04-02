import { Head, Link } from '@inertiajs/react';
import { Form } from '@inertiajs/react';
import BranchController, { index as branchesIndex } from '@/actions/App/Http/Controllers/BranchController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Branch {
    id: number;
    name: string;
    address: string;
    phone: string | null;
    is_active: boolean;
}

export default function BranchesEdit({ branch }: { branch: Branch }) {
    return (
        <>
            <Head title={`Editar — ${branch.name}`} />

            <div className="space-y-6 p-6">
                <Heading
                    title="Editar sucursal"
                    description={`Modificando los datos de ${branch.name}`}
                />

                <Form
                    {...BranchController.update.form(branch)}
                    className="max-w-lg space-y-5"
                >
                    {({ errors, processing }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="name">Nombre</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    defaultValue={branch.name}
                                    required
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="address">Dirección</Label>
                                <Input
                                    id="address"
                                    name="address"
                                    defaultValue={branch.address}
                                    required
                                />
                                <InputError message={errors.address} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="phone">Teléfono</Label>
                                <Input
                                    id="phone"
                                    name="phone"
                                    defaultValue={branch.phone ?? ''}
                                    placeholder="Opcional"
                                />
                                <InputError message={errors.phone} />
                            </div>

                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="is_active"
                                    name="is_active"
                                    defaultChecked={branch.is_active}
                                    value="1"
                                />
                                <Label htmlFor="is_active">Sucursal activa</Label>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Guardando...' : 'Guardar cambios'}
                                </Button>
                                <Button variant="outline" asChild>
                                    <Link href={branchesIndex.url()}>Cancelar</Link>
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}

BranchesEdit.layout = {
    breadcrumbs: [
        { title: 'Sucursales', href: branchesIndex.url() },
        { title: 'Editar sucursal', href: '#' },
    ],
};
