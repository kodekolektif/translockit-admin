'use client';

import { ReactNode, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarMenuSub,
    SidebarMenuSubItem,
    SidebarMenuSubButton,
    SidebarProvider,
} from '@/components/ui/sidebar';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    LayoutDashboard,
    Settings,
    Image as ImageIcon,
    HelpCircle,
    MoreHorizontal,
    Info,
    FileText,
    MessageSquare,
    Monitor,
    BarChart,
    Smartphone,
    ChevronDown
} from 'lucide-react';
import { apiClient } from '@/core/api/client';
import { toast } from 'sonner';

const contentManagement = [
    { name: 'Abouts', href: '/abouts', icon: Info },
    {
        name: 'Articles',
        href: '/articles',
        icon: FileText,
        children: [
            { name: 'Authors', href: '/authors' },
            { name: 'Category', href: '/category' },
        ]
    },
    { name: 'Brands', href: '/brands', icon: ImageIcon },
    { name: 'Testimonials', href: '/testimonials', icon: MessageSquare },
    { name: 'Software', href: '/software', icon: Monitor },
    { name: 'Projects', href: '/projects', icon: BarChart },
    {
        name: 'Mobile Apps',
        href: '/mobile-apps',
        icon: Smartphone,
        children: [
            { name: 'Mobile Lists', href: '/mobile-lists' },
        ]
    },
    { name: 'Faqs', href: '/faqs', icon: HelpCircle },
];

const bottomNavigation = [
    { name: 'App Settings', href: '/settings/app', icon: Settings },
    { name: 'Company Settings', href: '/settings/company', icon: Settings },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [user, setUser] = useState<{ name: string; email: string } | null>(null);

    useEffect(() => {
        try {
            const storedUser = localStorage.getItem('translockit_user');
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
        } catch (err) {
            console.error('Failed to parse user from local storage', err);
        }
    }, []);

    const handleLogout = async () => {
        try {
            await apiClient.post('/logout');
            localStorage.removeItem('access_token');
            localStorage.removeItem('translockit_user');
            router.push('/login');
            toast.success('Logged out');
        } catch {
            localStorage.removeItem('access_token');
            localStorage.removeItem('translockit_user');
            router.push('/login');
            toast.error('Failed to logout');
        }
    };

    return (
        <SidebarProvider>
            <div className="flex min-h-screen w-full">
                <Sidebar className="border-r">
                    <SidebarHeader className="flex h-16 items-center border-b px-6">
                        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg">
                            CMS Admin
                        </Link>
                    </SidebarHeader>
                    <SidebarContent>
                        <SidebarGroup>
                            <SidebarMenu>
                                <SidebarMenuItem>
                                    <SidebarMenuButton asChild isActive={pathname === '/dashboard'}>
                                        <Link href="/dashboard">
                                            <LayoutDashboard className="h-4 w-4" />
                                            <span>Dashboard</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </SidebarMenu>
                        </SidebarGroup>
                        <Collapsible defaultOpen className="group/collapsible">
                            <SidebarGroup>
                                <SidebarGroupLabel asChild>
                                    <CollapsibleTrigger>
                                        Content Management
                                        <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                                    </CollapsibleTrigger>
                                </SidebarGroupLabel>
                                <CollapsibleContent>
                                    <SidebarGroupContent>
                                        <SidebarMenu>
                                            {contentManagement.map((item) => (
                                                <SidebarMenuItem key={item.name}>
                                                    <SidebarMenuButton
                                                        asChild
                                                        isActive={pathname === item.href || (item.children && pathname.startsWith(item.href))}
                                                    >
                                                        <Link href={item.href}>
                                                            <item.icon className="h-4 w-4" />
                                                            <span>{item.name}</span>
                                                        </Link>
                                                    </SidebarMenuButton>
                                                    {item.children && (
                                                        <SidebarMenuSub>
                                                            {item.children.map((child) => (
                                                                <SidebarMenuSubItem key={child.name}>
                                                                    <SidebarMenuSubButton asChild isActive={pathname.startsWith(child.href)}>
                                                                        <Link href={child.href}>
                                                                            <span>{child.name}</span>
                                                                        </Link>
                                                                    </SidebarMenuSubButton>
                                                                </SidebarMenuSubItem>
                                                            ))}
                                                        </SidebarMenuSub>
                                                    )}
                                                </SidebarMenuItem>
                                            ))}
                                        </SidebarMenu>
                                    </SidebarGroupContent>
                                </CollapsibleContent>
                            </SidebarGroup>
                        </Collapsible>
                    </SidebarContent>
                    <SidebarFooter>
                        <Collapsible defaultOpen className="group/collapsible-settings">
                            <SidebarGroup className="p-0">
                                <SidebarGroupLabel asChild className="px-4">
                                    <CollapsibleTrigger>
                                        Settings
                                        <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible-settings:rotate-180" />
                                    </CollapsibleTrigger>
                                </SidebarGroupLabel>
                                <CollapsibleContent>
                                    <SidebarGroupContent>
                                        <SidebarMenu>
                                            {bottomNavigation.map((item) => (
                                                <SidebarMenuItem key={item.name}>
                                                    <SidebarMenuButton
                                                        asChild
                                                        isActive={pathname.startsWith(item.href)}
                                                    >
                                                        <Link href={item.href}>
                                                            <item.icon className="h-4 w-4" />
                                                            <span>{item.name}</span>
                                                        </Link>
                                                    </SidebarMenuButton>
                                                </SidebarMenuItem>
                                            ))}
                                        </SidebarMenu>
                                    </SidebarGroupContent>
                                </CollapsibleContent>
                            </SidebarGroup>
                        </Collapsible>
                        <SidebarGroup className="p-0 border-t mt-2">
                            <SidebarGroupContent>
                                <SidebarMenu>
                                    <SidebarMenuItem className="mt-2">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <SidebarMenuButton
                                                    size="lg"
                                                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                                                >
                                                    <Avatar className="h-8 w-8 rounded-lg">
                                                        <AvatarImage src="" alt={user?.name || "Admin User"} />
                                                        <AvatarFallback className="rounded-lg bg-primary text-primary-foreground">
                                                            {user?.name?.substring(0, 2)?.toUpperCase() || "AD"}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                                        <span className="truncate font-semibold">{user?.name || "Admin User"}</span>
                                                        <span className="truncate text-xs">{user?.email || "admin@example.com"}</span>
                                                    </div>
                                                    <MoreHorizontal className="ml-auto size-4" />
                                                </SidebarMenuButton>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent
                                                className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-56 rounded-lg"
                                                side="bottom"
                                                align="end"
                                                sideOffset={4}
                                            >
                                                <DropdownMenuLabel className="p-0 font-normal">
                                                    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                                        <Avatar className="h-8 w-8 rounded-lg">
                                                            <AvatarImage src="" alt={user?.name || "Admin User"} />
                                                            <AvatarFallback className="rounded-lg bg-primary text-primary-foreground">
                                                                {user?.name?.substring(0, 2)?.toUpperCase() || "AD"}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="grid flex-1 text-left text-sm leading-tight">
                                                            <span className="truncate font-semibold">{user?.name || "Admin User"}</span>
                                                            <span className="truncate text-xs text-muted-foreground">{user?.email || "admin@example.com"}</span>
                                                        </div>
                                                    </div>
                                                </DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-700">
                                                    Log out
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </SidebarMenuItem>
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>
                    </SidebarFooter>
                </Sidebar>
                <main className="flex-1 flex flex-col min-w-0 bg-gray-50/50">
                    <div className="flex h-16 items-center border-b px-6 bg-white shrink-0">
                        <h1 className="font-semibold text-lg capitalize">
                            {pathname.split('/')[1] || 'Dashboard'}
                        </h1>
                    </div>
                    <div className="flex-1 p-6 overflow-auto">
                        {children}
                    </div>
                </main>
            </div>
        </SidebarProvider>
    );
}
