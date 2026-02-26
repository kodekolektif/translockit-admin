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

interface ArticleItem {
    id: string; // Updated from number to string (UUID)
    thumbnail: string; // Updated from image to thumbnail
    is_published: boolean; // Updated from published to is_published
    title: string; // Direct top-level property now
    content: string; // Based on actual response instead of translations
    tags: string[];
    author: {
        id: string;
        name: string;
    } | null;
    category: {
        id: string;
        name: string;
    } | null;
    published_at: string;
    created_at: string;
}

export function ArticlesList() {
    const { data, meta, isLoading, actions, state, refetch } = useDataTable<ArticleItem>({
        endpoint: '/articles',
        queryKey: ['articles'],
    });

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this article?')) return;
        try {
            await apiClient.delete(`/articles/${id}`);
            toast.success('Article deleted successfully');
            refetch();
        } catch (error) {
            toast.error('Failed to delete article');
            console.error(error);
        }
    };

    const columns: ColumnDef<ArticleItem>[] = [
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
            accessorKey: 'thumbnail',
            header: 'Image',
            cell: ({ row }) => {
                const url = row.getValue('thumbnail') as string;
                return (
                    <div className="relative h-10 w-10">
                        {url ? (
                            <img src={url.startsWith('/') && !url.startsWith('//') ? `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8000'}${url}` : url} alt="thumbnail" className="rounded object-cover" />
                        ) : (
                            <div className="h-full w-full bg-muted rounded flex items-center justify-center text-xs">No img</div>
                        )}
                    </div>
                );
            },
        },
        {
            id: 'title',
            accessorFn: (row) => row.title || 'Unknown',
            header: () => (
                <div
                    className="flex cursor-pointer items-center space-x-2"
                    onClick={() => actions.handleSort('title')}
                >
                    <span>Title</span>
                </div>
            ),
        },
        {
            id: 'category',
            accessorFn: (row) => row.category?.name || '-',
            header: 'Category',
        },
        {
            id: 'author',
            accessorFn: (row) => row.author?.name || '-',
            header: 'Author',
        },
        {
            accessorKey: 'is_published',
            header: 'Status',
            cell: ({ row }) => {
                const published = row.getValue('is_published') as boolean;
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
                        <Link href={`/articles/${id}/edit`}>
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
        <div className="space-y-4 bg-white p-6 shadow-sm rounded-lg border">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight">Articles</h2>
                <Link href="/articles/create">
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
                searchPlaceholder="Search articles..."
                onSearch={actions.handleSearch}
                searchValue={state.search}
                meta={meta}
                onPageChange={actions.setPage}
            />
        </div>
    );
}
