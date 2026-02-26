'use client';

import { useEffect, useState } from 'react';
import { ArticleForm } from '@/features/articles/components/ArticleForm';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { useParams } from 'next/navigation';
import { apiClient } from '@/core/api/client';
import { toast } from 'sonner';

export default function EditArticlePage() {
    const params = useParams();
    const articleId = params.id as string;
    const [initialData, setInitialData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchArticle = async () => {
            try {
                const response = await apiClient.get(`/articles/${articleId}`);
                setInitialData(response.data.data || response.data);
            } catch (error) {
                console.error(error);
                toast.error('Failed to fetch article details.');
            } finally {
                setIsLoading(false);
            }
        };

        if (articleId) {
            fetchArticle();
        }
    }, [articleId]);

    if (isLoading) {
        return <div className="p-6">Loading article...</div>;
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto py-6">
            <div className="space-y-2">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/articles">Articles</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>Edit</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
                <h2 className="text-3xl font-bold tracking-tight">Edit Article</h2>
            </div>
            <ArticleForm initialData={initialData} articleId={articleId} />
        </div>
    );
}
