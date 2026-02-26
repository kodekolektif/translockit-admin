'use client';

import { useEffect, useState } from 'react';
import { CategoryForm } from '@/features/categories/components/CategoryForm';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { apiClient } from '@/core/api/client';
import { useParams } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditCategoryPage() {
    const params = useParams();
    const [initialData, setInitialData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCategory = async () => {
            try {
                const { data } = await apiClient.get(`/categories/${params.id}`);
                setInitialData(data.data || data);
            } catch (error) {
                console.error('Failed to fetch category', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (params.id) {
            fetchCategory();
        }
    }, [params.id]);

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-8 w-[200px]" />
                <div className="max-w-2xl bg-white p-6 rounded-lg border space-y-4">
                    <Skeleton className="h-8 w-1/3" />
                    <Skeleton className="h-[400px] w-full" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/categories">Categories</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>Edit</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <div className="max-w-2xl bg-white p-6 rounded-lg border">
                <h1 className="text-2xl font-semibold mb-6">Edit Category</h1>
                <CategoryForm initialData={initialData} categoryId={params.id as string} />
            </div>
        </div>
    );
}
