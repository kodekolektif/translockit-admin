'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { AuthorForm } from '@/features/authors/components/AuthorForm';
import { apiClient } from '@/core/api/client';
import { toast } from 'sonner';

export default function EditAuthorPage() {
    const params = useParams();
    const authorId = params.id as string;
    const [initialData, setInitialData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAuthor = async () => {
            try {
                const response = await apiClient.get(`/authors/${authorId}`);
                setInitialData(response.data.data || response.data);
            } catch (error) {
                console.error(error);
                toast.error('Failed to fetch author details.');
            } finally {
                setIsLoading(false);
            }
        };

        if (authorId) {
            fetchAuthor();
        }
    }, [authorId]);

    if (isLoading) {
        return <div className="p-6">Loading author...</div>;
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto py-6">
            <div className="space-y-2">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/authors">Authors</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>Edit</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
                <h2 className="text-3xl font-bold tracking-tight">Edit Author</h2>
            </div>

            {initialData ? (
                <AuthorForm initialData={initialData} authorId={authorId} />
            ) : (
                <div className="p-6 text-destructive">Author not found</div>
            )}
        </div>
    );
}
