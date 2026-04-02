import { Head, Link, router, usePage } from '@inertiajs/react';
import { PlusIcon, PencilIcon, TrashIcon } from 'lucide-react';
import UserController, { index as usersIndex } from '@/actions/App/Http/Controllers/UserController';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Role {
    value: string;
    label: string;
}

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
}

interface PaginatedUsers {
    data: User[];
    current_page: number;
    last_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

export default function UsersIndex({
    users,
    roles,
}: {
    users: PaginatedUsers;
    roles: Role[];
}) {
    const { flash, auth } = usePage().props;

    const roleLabel = (value: string) => roles.find((r) => r.value === value)?.label ?? value;

    const isAdmin = auth.user.role === 'admin';

    function handleDelete(user: User) {
        if (confirm(`¿Eliminar al usuario "${user.name}"?`)) {
            router.delete(UserController.destroy.url(user));
        }
    }

    return (
        <>
            <Head title="Usuarios" />

            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight">Usuarios</h1>
                        <p className="text-sm text-muted-foreground">
                            {users.total} usuario{users.total !== 1 ? 's' : ''}
                        </p>
                    </div>
                    <Button asChild>
                        <Link href={UserController.create.url()}>
                            <PlusIcon />
                            Nuevo usuario
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
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Correo</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Rol</th>
                                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {users.data.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-4 py-10 text-center text-muted-foreground">
                                        No hay usuarios registrados.
                                    </td>
                                </tr>
                            )}
                            {users.data.map((user) => (
                                <tr key={user.id} className="hover:bg-muted/30">
                                    <td className="px-4 py-3 font-medium">
                                        {user.name}
                                        {user.id === auth.user.id && (
                                            <span className="ml-2 text-xs text-muted-foreground">(tú)</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                                    <td className="px-4 py-3">
                                        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                                            {roleLabel(user.role)}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button variant="ghost" size="icon" asChild>
                                                <Link href={UserController.edit.url(user)}>
                                                    <PencilIcon />
                                                    <span className="sr-only">Editar</span>
                                                </Link>
                                            </Button>
                                            {isAdmin && user.id !== auth.user.id && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-destructive hover:text-destructive"
                                                    onClick={() => handleDelete(user)}
                                                >
                                                    <TrashIcon />
                                                    <span className="sr-only">Eliminar</span>
                                                </Button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {users.last_page > 1 && (
                    <div className="flex items-center justify-center gap-1">
                        {users.links.map((link, i) => (
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

UsersIndex.layout = {
    breadcrumbs: [{ title: 'Usuarios', href: usersIndex.url() }],
};
