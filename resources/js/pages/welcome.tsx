import { Head, Link, usePage } from '@inertiajs/react';
import { dashboard, login } from '@/routes';

export default function Welcome() {
    const { auth } = usePage().props;

    return (
        <>
            <Head title="Tienda Saporo" />
            <div className="flex min-h-screen flex-col items-center justify-center bg-[#FDFDFC] p-6 text-[#1b1b18] dark:bg-[#0a0a0a]">
                <div className="w-full max-w-lg text-center">
                    <h1 className="mb-3 text-5xl font-bold tracking-tight text-[#1b1b18] dark:text-[#EDEDEC]">
                        Tienda Saporo
                    </h1>
                    <p className="mb-8 text-lg text-[#706f6c] dark:text-[#A1A09A]">
                        Sistema de gestión de inventario y ventas
                    </p>

                    <div className="mb-8 flex justify-center gap-4">
                        {auth.user ? (
                            <Link
                                href={dashboard()}
                                className="inline-block rounded-md bg-[#1b1b18] px-6 py-2.5 text-sm font-medium text-white hover:bg-[#3d3d38] dark:bg-[#EDEDEC] dark:text-[#1b1b18] dark:hover:bg-white"
                            >
                                Ir al Dashboard
                            </Link>
                        ) : (
                            <Link
                                href={login()}
                                className="inline-block rounded-md bg-[#1b1b18] px-6 py-2.5 text-sm font-medium text-white hover:bg-[#3d3d38] dark:bg-[#EDEDEC] dark:text-[#1b1b18] dark:hover:bg-white"
                            >
                                Iniciar sesión
                            </Link>
                        )}
                    </div>

                    <div className="rounded-lg border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800 dark:border-amber-800/40 dark:bg-amber-900/20 dark:text-amber-300">
                        <p className="font-semibold">Aviso</p>
                        <p className="mt-1">
                            Este sitio es una aplicación de demostración. No representa una tienda real ni procesa transacciones reales.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
