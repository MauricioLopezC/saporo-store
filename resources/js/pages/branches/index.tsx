import { Head, Link, router, usePage } from '@inertiajs/react';
import { PlusIcon, PencilIcon, TrashIcon } from 'lucide-react';
import BranchController from '@/actions/App/Http/Controllers/BranchController';
import { index as branchesIndex } from '@/actions/App/Http/Controllers/BranchController';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Branch {
    id: number;
    name: string;
    address: string;
    phone: string | null;
    is_active: boolean;
    created_at: string;
}

interface PaginatedBranches {
    data: Branch[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

export default function BranchesIndex({ branches }: { branches: PaginatedBranches }) {
    const { flash } = usePage().props;

    function handleDelete(branch: Branch) {
        if (confirm(`¿Eliminar la sucursal "${branch.name}"?`)) {
            router.delete(BranchController.destroy.url(branch));
        }
    }

    return (
        <>
            <Head title="Sucursales" />

            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight">Sucursales</h1>
                        <p className="text-sm text-muted-foreground">
                            {branches.total} sucursal{branches.total !== 1 ? 'es' : ''} registrada{branches.total !== 1 ? 's' : ''}
                        </p>
                    </div>
                    <Button asChild>
                        <Link href={BranchController.create.url()}>
                            <PlusIcon />
                            Nueva sucursal
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
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Dirección</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Teléfono</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Estado</th>
                                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {branches.data.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                                        No hay sucursales registradas.
                                    </td>
                                </tr>
                            )}
                            {branches.data.map((branch) => (
                                <tr key={branch.id} className="hover:bg-muted/30">
                                    <td className="px-4 py-3 font-medium">{branch.name}</td>
                                    <td className="px-4 py-3 text-muted-foreground">{branch.address}</td>
                                    <td className="px-4 py-3 text-muted-foreground">{branch.phone ?? '—'}</td>
                                    <td className="px-4 py-3">
                                        <Badge variant={branch.is_active ? 'default' : 'secondary'}>
                                            {branch.is_active ? 'Activa' : 'Inactiva'}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button variant="ghost" size="icon" asChild>
                                                <Link href={BranchController.edit.url(branch)}>
                                                    <PencilIcon />
                                                    <span className="sr-only">Editar</span>
                                                </Link>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-destructive hover:text-destructive"
                                                onClick={() => handleDelete(branch)}
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

                {branches.last_page > 1 && (
                    <div className="flex items-center justify-center gap-1">
                        {branches.links.map((link, i) => (
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

BranchesIndex.layout = {
    breadcrumbs: [
        { title: 'Sucursales', href: branchesIndex.url() },
    ],
};
