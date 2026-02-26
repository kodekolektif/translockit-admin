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
import { AboutForm } from '@/features/abouts/components/AboutForm';
import { apiClient } from '@/core/api/client';
import { toast } from 'sonner';

export default function EditAboutPage() {
    const params = useParams();
    const aboutId = params.id as string;
    const [initialData, setInitialData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAbout = async () => {
            try {
                const response = await apiClient.get(`/abouts/${aboutId}`);
                setInitialData(response.data.data || response.data);
            } catch (error) {
                console.error(error);
                toast.error('Failed to fetch about details.');
            } finally {
                setIsLoading(false);
            }
        };

        if (aboutId) {
            fetchAbout();
        }
    }, [aboutId]);

    if (isLoading) {
        return <div className="p-6">Loading about...</div>;
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto py-6">
            <div className="space-y-2">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/abouts">Abouts</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>Edit</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
                <h2 className="text-3xl font-bold tracking-tight">Edit About</h2>
            </div>

            {initialData ? (
                <AboutForm initialData={initialData} aboutId={aboutId} />
            ) : (
                <div className="p-6 text-destructive">About not found</div>
            )}
        </div>
    );
}
