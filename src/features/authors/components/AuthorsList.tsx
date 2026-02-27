'use client';

import { useDataTable } from '@/core/table/useDataTable';
import { DataTable } from '@/core/table/DataTable';
import { Button } from '@/components/ui/button';
import { Edit, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { Checkbox } from '@/components/ui/checkbox';
import { ColumnDef } from '@tanstack/react-table';
import { toast } from 'sonner';
import { apiClient } from '@/core/api/client';

import { clearSessionCacheByPrefix } from '@/core/api/cache';

interface AuthorItem {
    id: string;
    profile: string;
    name: string;
    title: string;
    description: string;
    social_links: string;
    lang: string;
    created_at: string;
    updated_at: string;
}

export function AuthorsList() {
    const { data, meta, isLoading, actions, state, refetch } = useDataTable<AuthorItem>({
        endpoint: '/authors',
        queryKey: ['authors'],
    });

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this author?')) return;
        try {
            await apiClient.delete(`/authors/${id}`);
            clearSessionCacheByPrefix('cache_/authors');
            toast.success('Author deleted successfully');
            refetch();
        } catch (error) {
            toast.error('Failed to delete author');
            console.error(error);
        }
    };

    const columns: ColumnDef<AuthorItem>[] = [
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    checked={table.getIsAllPageRowsSelected()}
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                />
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: 'profile',
            header: 'Profile',
            cell: ({ row }) => {
                const url = row.getValue('profile') as string;
                return (
                    <div className="relative h-10 w-10 overflow-hidden rounded-full">
                        {url ? (
                            <img src={url.startsWith('/') && !url.startsWith('//') ? `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8000'}${url}` : url} alt="profile" className="h-full w-full object-cover" />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center bg-muted text-xs">No img</div>
                        )}
                    </div>
                );
            },
        },
        {
            id: 'name',
            accessorFn: (row) => row.name || 'Unknown',
            header: () => (
                <div
                    className="flex cursor-pointer items-center space-x-2"
                    onClick={() => actions.handleSort('name')}
                >
                    <span>Name</span>
                </div>
            ),
        },
        {
            id: 'title',
            accessorFn: (row) => row.title || '-',
            header: 'Title',
        },
        {
            accessorKey: 'lang',
            header: 'Language',
            cell: ({ row }) => {
                const lang = row.getValue('lang') as string;
                return <span className="uppercase">{lang}</span>;
            },
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => {
                const id = row.original.id;
                return (
                    <div className="flex items-center gap-2">
                        <Link href={`/authors/${id}/edit`}>
                            <Button variant="ghost" size="icon">
                                <Edit className="h-4 w-4" />
                            </Button>
                        </Link>
                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(id)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                );
            },
        },
    ];

    return (
        <div className="space-y-4 rounded-lg border bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight">Authors</h2>
                <Link href="/authors/create">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add New
                    </Button>
                </Link>
            </div>

            <DataTable
                columns={columns}
                data={data}
                isLoading={isLoading}
                searchPlaceholder="Search authors..."
                onSearch={actions.handleSearch}
                searchValue={state.search}
                meta={meta}
                onPageChange={actions.setPage}
            />
        </div>
    );
}
