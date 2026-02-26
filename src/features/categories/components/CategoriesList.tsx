'use client';

import { Button } from '@/components/ui/button';
import { Edit2, Plus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/core/api/client';
import { toast } from 'sonner';
import { ColumnDef } from '@tanstack/react-table';
import { useDataTable } from '@/core/table/useDataTable';
import { DataTable } from '@/core/table/DataTable';
import { format } from 'date-fns';

interface CategoryItem {
    id: string;
    name: string;
    is_active: boolean;
    lang: string;
    created_at: string;
    updated_at: string;
}

export function CategoriesList() {
    const router = useRouter();

    const { data, meta, isLoading, actions, state, refetch } = useDataTable<CategoryItem>({
        endpoint: '/categories',
        queryKey: ['categories'],
    });

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this category?')) return;
        try {
            await apiClient.delete(`/categories/${id}`);
            toast.success('Category deleted successfully');
            refetch();
        } catch (error) {
            toast.error('Failed to delete category');
            console.error(error);
        }
    };

    const columns: ColumnDef<CategoryItem>[] = [
        {
            id: 'name',
            accessorFn: (row) => {
                if (typeof row.name === 'string') return row.name;
                if (typeof row.name === 'object' && row.name !== null) {
                    return (row.name as any).en || (row.name as any).es || 'Unnamed Category';
                }
                return 'Unnamed Category';
            },
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
            accessorKey: 'is_active',
            header: 'Status',
            cell: ({ row }) => {
                const isActive = row.getValue('is_active') as boolean;
                return (
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {isActive ? 'Active' : 'Inactive'}
                    </span>
                );
            },
        },
        {
            accessorKey: 'created_at',
            header: 'Date Created',
            cell: ({ row }) => {
                try {
                    return format(new Date(row.getValue('created_at')), 'MMM dd, yyyy');
                } catch {
                    return row.getValue('created_at');
                }
            },
        },
        {
            id: 'actions',
            header: '...',
            cell: ({ row }) => {
                const id = row.original.id;
                return (
                    <div className="flex items-center justify-end gap-2 pr-10">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push(`/categories/${id}/edit`)}
                            className="bg-transparent hover:bg-muted text-muted-foreground border-border border"
                        >
                            <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => handleDelete(id)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                );
            },
        },
    ];

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <Button onClick={() => router.push('/categories/create')} className="bg-orange-500 hover:bg-orange-600 text-white font-medium">
                    <Plus className="mr-2 h-4 w-4" /> Add Category
                </Button>
            </div>

            <DataTable
                columns={columns}
                data={data}
                isLoading={isLoading}
                searchPlaceholder="Search categories..."
                onSearch={actions.handleSearch}
                searchValue={state.search}
                meta={meta}
                onPageChange={actions.setPage}
            />
        </div>
    );
}
