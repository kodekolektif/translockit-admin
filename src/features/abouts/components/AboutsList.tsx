'use client';

import { useDataTable } from '@/core/table/useDataTable';
import { DataTable } from '@/core/table/DataTable';
import { Button } from '@/components/ui/button';
import { Edit, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { Checkbox } from '@/components/ui/checkbox';
import { ColumnDef } from '@tanstack/react-table';
import { toast } from 'sonner';

interface AboutItem {
    id: number;
    image: string;
    published: boolean;
    translations: {
        en: { title: string; description: string };
        es: { title: string; description: string };
    };
}

export function AboutsList() {
    const { data, meta, isLoading, actions, state } = useDataTable<AboutItem>({
        endpoint: '/abouts',
        queryKey: ['abouts'],
    });

    const columns: ColumnDef<AboutItem>[] = [
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
            accessorKey: 'image',
            header: 'Image',
            cell: ({ row }) => {
                const url = row.getValue('image') as string;
                return (
                    <div className="relative h-10 w-10">
                        {url ? (
                            <img src={url} alt="thumbnail" className="rounded object-cover" />
                        ) : (
                            <div className="h-full w-full bg-muted rounded flex items-center justify-center text-xs">No img</div>
                        )}
                    </div>
                );
            },
        },
        {
            id: 'title',
            accessorFn: (row) => row.translations?.en?.title || 'Unknown',
            header: () => (
                <div
                    className="flex cursor-pointer items-center space-x-2"
                    onClick={() => actions.handleSort('title')}
                >
                    <span>Title (EN)</span>
                    {/* Add sort icon here if needed */}
                </div>
            ),
        },
        {
            accessorKey: 'published',
            header: 'Status',
            cell: ({ row }) => {
                const published = row.getValue('published') as boolean;
                return (
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {published ? 'Published' : 'Draft'}
                    </span>
                );
            },
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => {
                const id = row.original.id;
                return (
                    <div className="flex items-center gap-2">
                        <Link href={`/abouts/${id}/edit`}>
                            <Button variant="ghost" size="icon">
                                <Edit className="h-4 w-4" />
                            </Button>
                        </Link>
                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => toast.info('Delete is not implemented yet')}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                );
            },
        },
    ];

    return (
        <div className="space-y-4 bg-white p-6 shadow-sm rounded-lg border">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight">Abouts</h2>
                <Link href="/abouts/create">
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
                searchPlaceholder="Search abouts..."
                onSearch={actions.handleSearch}
                searchValue={state.search}
                meta={meta}
                onPageChange={actions.setPage}
            />
        </div>
    );
}
