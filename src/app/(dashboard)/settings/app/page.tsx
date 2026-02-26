'use client';

import { useEffect, useState } from 'react';
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from '@/components/ui/breadcrumb';
import { AppSettingsForm } from '@/features/settings/app/components/AppSettingsForm';
import { apiClient } from '@/core/api/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Settings } from 'lucide-react';

export default function AppSettingsPage() {
    const [initialData, setInitialData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const { data } = await apiClient.get('/settings/app');
                setInitialData(data.data || data);
            } catch (err: any) {
                console.error('Failed to fetch app settings', err);
                setError(err.message || 'Failed to initialize app settings');
            } finally {
                setIsLoading(false);
            }
        };

        fetchSettings();
    }, []);

    if (isLoading) {
        return (
            <div className="space-y-6 max-w-5xl mx-auto py-6">
                <Skeleton className="h-8 w-[200px]" />
                <Skeleton className="h-[400px] w-full rounded-lg" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-6 max-w-5xl mx-auto py-6">
                <Alert variant="destructive">
                    <AlertTitle>Error Loading Settings</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto py-6">
            <div className="space-y-2">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <span className="text-muted-foreground">Settings</span>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>App Settings</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
                <div className="flex items-center space-x-2">
                    <Settings className="h-8 w-8 text-muted-foreground" />
                    <h2 className="text-3xl font-bold tracking-tight">App Configuration</h2>
                </div>
                <p className="text-muted-foreground">
                    Manage global application settings, branding, and API integrations.
                </p>
            </div>

            <AppSettingsForm initialData={initialData} />
        </div>
    );
}
