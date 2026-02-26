'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ImageDropzone } from '@/core/upload/ImageDropzone';
import { apiClient } from '@/core/api/client';

const appSettingsSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    keywords: z.string().optional(),
    favicon: z.any().optional(),
    logo: z.any().optional(),
    logo_dark: z.any().optional(),
    default_language: z.string().default('en'),
    default_target_language: z.string().default('es'),
    translation_ai_service: z.string().default('gemini'),
    gemini_api_key: z.string().optional(),
    gemini_api_url: z.string().optional(),
    openai_api_key: z.string().optional(),
    openai_api_url: z.string().optional(),
});

type AppSettingsFormValues = z.infer<typeof appSettingsSchema>;

interface AppSettingsFormProps {
    initialData?: AppSettingsFormValues | null;
}

export function AppSettingsForm({ initialData }: AppSettingsFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const form = useForm<AppSettingsFormValues>({
        resolver: zodResolver(appSettingsSchema) as any, // Modified line
        defaultValues: {
            title: initialData?.title || '',
            description: initialData?.description || '',
            keywords: initialData?.keywords || '',
            favicon: initialData?.favicon || undefined,
            logo: initialData?.logo || undefined,
            logo_dark: initialData?.logo_dark || undefined,
            default_language: initialData?.default_language || 'en',
            default_target_language: initialData?.default_target_language || 'es',
            translation_ai_service: initialData?.translation_ai_service || 'gemini',
            gemini_api_key: initialData?.gemini_api_key || '',
            gemini_api_url: initialData?.gemini_api_url || '',
            openai_api_key: initialData?.openai_api_key || '',
            openai_api_url: initialData?.openai_api_url || '',
        } as AppSettingsFormValues,
    });

    const onSubmit = async (data: AppSettingsFormValues) => {
        setIsLoading(true);
        try {
            const formData = new FormData();
            const { dirtyFields } = form.formState;

            if (Object.keys(dirtyFields).length === 0) {
                toast.info('No changes to save');
                setIsLoading(false);
                return;
            }

            // Text fields
            if (dirtyFields.title) formData.append('title', data.title);
            if (dirtyFields.description) formData.append('description', data.description || '');
            if (dirtyFields.keywords) formData.append('keywords', data.keywords || '');

            if (dirtyFields.default_language) formData.append('default_language', data.default_language);
            if (dirtyFields.default_target_language) formData.append('default_target_language', data.default_target_language);
            if (dirtyFields.translation_ai_service) formData.append('translation_ai_service', data.translation_ai_service);

            if (dirtyFields.gemini_api_key) formData.append('gemini_api_key', data.gemini_api_key || '');
            if (dirtyFields.gemini_api_url) formData.append('gemini_api_url', data.gemini_api_url || '');
            if (dirtyFields.openai_api_key) formData.append('openai_api_key', data.openai_api_key || '');
            if (dirtyFields.openai_api_url) formData.append('openai_api_url', data.openai_api_url || '');

            // Image fields
            if (dirtyFields.favicon && data.favicon instanceof File) formData.append('favicon', data.favicon);
            if (dirtyFields.logo && data.logo instanceof File) formData.append('logo', data.logo);
            if (dirtyFields.logo_dark && data.logo_dark instanceof File) formData.append('logo_dark', data.logo_dark);

            // Depending on Backend, settings updates often use POST or spoofed PUT
            formData.append('_method', 'PUT');

            await apiClient.post('/settings/app', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            toast.success('App settings updated successfully');
            form.reset(data);
            router.refresh();
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Failed to update app settings');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                    <div className="space-y-6 rounded-lg border p-6 bg-card">
                        <h2 className="text-lg font-medium tracking-tight">General Information</h2>

                        <FormField
                            control={form.control}
                            name={"title" as keyof AppSettingsFormValues}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>App Title <span className="text-red-500">*</span></FormLabel>
                                    <FormControl>
                                        <Input placeholder="E.g., Translock IT" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name={"description" as keyof AppSettingsFormValues}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="App description for SEO..." rows={4} {...field} value={field.value || ''} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name={"keywords" as keyof AppSettingsFormValues}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Keywords</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Comma separated keywords (e.g., ai, translation)" {...field} value={field.value || ''} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 rounded-lg border p-6 bg-card">
                        <FormField
                            control={form.control}
                            name={"favicon" as keyof AppSettingsFormValues}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Favicon</FormLabel>
                                    <FormControl>
                                        <ImageDropzone value={field.value} onChange={field.onChange} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name={"logo" as keyof AppSettingsFormValues}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Logo (Light Mode)</FormLabel>
                                    <FormControl>
                                        <ImageDropzone value={field.value} onChange={field.onChange} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name={"logo_dark" as keyof AppSettingsFormValues}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Logo (Dark Mode)</FormLabel>
                                    <FormControl>
                                        <ImageDropzone value={field.value} onChange={field.onChange} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="space-y-6 rounded-lg border p-6 bg-card">
                        <h2 className="text-lg font-medium tracking-tight">Localization & AI</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name={"default_language" as keyof AppSettingsFormValues}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Default Source Language</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a source language" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="en">English (EN)</SelectItem>
                                                <SelectItem value="es">Spanish (ES)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name={"default_target_language" as keyof AppSettingsFormValues}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Default Target Language</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a target language" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="en">English (EN)</SelectItem>
                                                <SelectItem value="es">Spanish (ES)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name={"translation_ai_service" as keyof AppSettingsFormValues}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Translation AI Service Provider</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select an AI Provider" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="gemini">Google Gemini</SelectItem>
                                            <SelectItem value="openai">OpenAI</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="space-y-6 rounded-lg border p-6 bg-card">
                        <h2 className="text-lg font-medium tracking-tight">API Configurations</h2>

                        <div className="space-y-4">
                            <h3 className="font-semibold text-sm text-muted-foreground uppercase">Gemini Configuration</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name={"gemini_api_key" as keyof AppSettingsFormValues}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>API Key</FormLabel>
                                            <FormControl>
                                                <Input type="password" placeholder="AIzaSy..." {...field} value={field.value || ''} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name={"gemini_api_url" as keyof AppSettingsFormValues}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>API URL</FormLabel>
                                            <FormControl>
                                                <Input placeholder="https://..." {...field} value={field.value || ''} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t">
                            <h3 className="font-semibold text-sm text-muted-foreground uppercase">OpenAI Configuration</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name={"openai_api_key" as keyof AppSettingsFormValues}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>API Key</FormLabel>
                                            <FormControl>
                                                <Input type="password" placeholder="sk-..." {...field} value={field.value || ''} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name={"openai_api_url" as keyof AppSettingsFormValues}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>API URL</FormLabel>
                                            <FormControl>
                                                <Input placeholder="https://..." {...field} value={field.value || ''} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button type="submit" size="lg" disabled={form.formState.isSubmitting} className="bg-orange-500 hover:bg-orange-600 text-white font-medium px-8">
                            {form.formState.isSubmitting ? 'Saving Changes...' : 'Save Settings'}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
