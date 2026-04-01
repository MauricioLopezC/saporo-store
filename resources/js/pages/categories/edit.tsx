import { Form, Head, Link } from '@inertiajs/react';
import CategoryController, { index as categoriesIndex } from '@/actions/App/Http/Controllers/CategoryController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Category {
    id: number;
    name: string;
    description: string | null;
    is_active: boolean;
}

export default function CategoriesEdit({ category }: { category: Category }) {
    return (
        <>
            <Head title={`Editar — ${category.name}`} />

            <div className="space-y-6 p-6">
                <Heading title="Editar categoría" description={`Modificando "${category.name}"`} />

                <Form {...CategoryController.update.form(category)} className="max-w-lg space-y-5">
                    {({ errors, processing }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="name">Nombre</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    defaultValue={category.name}
                                    required
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="description">Descripción</Label>
                                <Input
                                    id="description"
                                    name="description"
                                    defaultValue={category.description ?? ''}
                                    placeholder="Opcional"
                                />
                                <InputError message={errors.description} />
                            </div>

                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="is_active"
                                    name="is_active"
                                    defaultChecked={category.is_active}
                                    value="1"
                                />
                                <Label htmlFor="is_active">Categoría activa</Label>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Guardando...' : 'Guardar cambios'}
                                </Button>
                                <Button variant="outline" asChild>
                                    <Link href={categoriesIndex.url()}>Cancelar</Link>
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}

CategoriesEdit.layout = {
    breadcrumbs: [
        { title: 'Categorías', href: categoriesIndex.url() },
        { title: 'Editar categoría', href: '#' },
    ],
};
