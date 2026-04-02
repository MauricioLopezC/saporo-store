import { Link, usePage } from '@inertiajs/react';
import { BookOpen, Building2, FolderGit2, LayoutGrid, Package, ShieldCheck, ShoppingCart, Tag, Truck, TrendingUp, Users, Warehouse } from 'lucide-react';
import { index as branchesIndex } from '@/actions/App/Http/Controllers/BranchController';
import { index as categoriesIndex } from '@/actions/App/Http/Controllers/CategoryController';
import { index as customersIndex } from '@/actions/App/Http/Controllers/CustomerController';
import { index as productsIndex } from '@/actions/App/Http/Controllers/ProductController';
import { index as productStockIndex } from '@/actions/App/Http/Controllers/ProductStockController';
import { index as salesIndex } from '@/actions/App/Http/Controllers/SaleController';
import { index as stockMovementsIndex } from '@/actions/App/Http/Controllers/StockMovementController';
import { index as suppliersIndex } from '@/actions/App/Http/Controllers/SupplierController';
import { index as usersIndex } from '@/actions/App/Http/Controllers/UserController';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';


const footerNavItems: NavItem[] = [
];

export function AppSidebar() {
    const { lowStockCount } = usePage().props;

    const mainNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: dashboard(),
            icon: LayoutGrid,
        },
        {
            title: 'Clientes',
            href: customersIndex.url(),
            icon: Users,
        },
        {
            title: 'Productos',
            href: productsIndex.url(),
            icon: Package,
        },
        {
            title: 'Categorías',
            href: categoriesIndex.url(),
            icon: Tag,
        },
        {
            title: 'Ventas',
            href: salesIndex.url(),
            icon: ShoppingCart,
        },
        {
            title: 'Proveedores',
            href: suppliersIndex.url(),
            icon: Truck,
        },
        {
            title: 'Inventario',
            href: productStockIndex.url(),
            icon: Warehouse,
            badge: lowStockCount,
        },
        {
            title: 'Movimientos',
            href: stockMovementsIndex.url(),
            icon: TrendingUp,
        },
        {
            title: 'Sucursales',
            href: branchesIndex.url(),
            icon: Building2,
        },
        {
            title: 'Usuarios',
            href: usersIndex.url(),
            icon: ShieldCheck,
        },
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
