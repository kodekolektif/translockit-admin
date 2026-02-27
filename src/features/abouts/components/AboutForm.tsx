'use client';

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
import { Switch } from '@/components/ui/switch';
import { MultiLanguageForm } from '@/core/i18n-form/MultiLanguageForm';
import { ImageDropzone } from '@/core/upload/ImageDropzone';
import { RichEditor } from '@/core/editor/RichEditor';
import { apiClient } from '@/core/api/client';
import { useQueryClient } from '@tanstack/react-query';
import { clearSessionCacheByPrefix } from '@/core/api/cache';

const aboutSchema = z.object({
    image: z.any().optional(), // Can be string URL or File
    is_active: z.boolean().default(true),
    title: z.object({
        en: z.string().min(1, 'Title (EN) is required'),
        es: z.string().optional(),
    }),
    description: z.object({
        en: z.string().min(1, 'Description (EN) is required'),
        es: z.string().optional(),
    }),
    lang: z.string().default('en'),
});

type AboutFormValues = any; // Bypass strict TS checks for dynamic dynamic schemas

interface AboutFormProps {
    initialData?: AboutFormValues | null;
    aboutId?: string;
}

export function AboutForm({ initialData, aboutId }: AboutFormProps) {
    const router = useRouter();
    const queryClient = useQueryClient();

    const form = useForm<any>({
        resolver: zodResolver(aboutSchema),
        defaultValues: initialData ? (() => {
            const title = { en: initialData.title || '', es: '' };
            const description = { en: initialData.description || '', es: '' };
            if (initialData.translations && Array.isArray(initialData.translations)) {
                initialData.translations.forEach((tr: any) => {
                    if (tr.lang === 'es') {
                        title.es = tr.title || '';
                        description.es = tr.description || '';
                    }
                });
            }
            return {
                ...initialData,
                title,
                description,
                is_active: initialData.is_active ?? true,
                image: initialData.image || null,
                lang: initialData.lang || 'en',
            };
        })() : {
            is_active: true,
            title: { en: '', es: '' },
            description: { en: '', es: '' },
            lang: 'en',
        },
    });

    const onSubmit = async (data: AboutFormValues) => {
        try {
            const formData = new FormData();
            formData.append('is_active', data.is_active ? '1' : '0');
            formData.append('title[en]', data.title.en);
            if (data.title.es) formData.append('title[es]', data.title.es);
            formData.append('description[en]', data.description.en);
            if (data.description.es) formData.append('description[es]', data.description.es);
            formData.append('lang', data.lang || 'en');

            if (data.image instanceof File) {
                formData.append('image', data.image);
            }

            if (initialData && aboutId) {
                // Mock edit with spoofed METHOD for Laravel
                formData.append('_method', 'PUT');
                await apiClient.post(`/abouts/${aboutId}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                toast.success('About updated effectively');
            } else {
                await apiClient.post('/abouts', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                toast.success('About created effectively');
            }

            clearSessionCacheByPrefix('cache_/abouts');
            queryClient.invalidateQueries({ queryKey: ['abouts'] });

            router.push('/abouts');
            router.refresh();
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Something went wrong.');
        }
    };

    return (
        <div className="w-full">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                    <div className="space-y-8">
                        <FormField
                            control={form.control}
                            name="image"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Image <span className="text-red-500">*</span></FormLabel>
                                    <FormControl>
                                        <ImageDropzone
                                            value={field.value}
                                            onChange={field.onChange}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <MultiLanguageForm translateEndpoint="/translate" fieldsToTranslate={['title', 'description']}>
                            {(lang) => (
                                <>
                                    <FormField
                                        control={form.control}
                                        name={`title.${lang}` as const}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Title ({lang.toUpperCase()})</FormLabel>
                                                <FormControl>
                                                    <Input placeholder={`Title in ${lang.toUpperCase()}`} {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name={`description.${lang}` as const}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Description ({lang.toUpperCase()})</FormLabel>
                                                <FormControl>
                                                    <RichEditor
                                                        value={field.value}
                                                        onChange={field.onChange}
                                                        placeholder={`Enter rich text description in ${lang.toUpperCase()}`}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </>
                            )}
                        </MultiLanguageForm>

                        <FormField
                            control={form.control}
                            name="is_active"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center space-x-3 space-y-0 pt-4">
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            className="data-[state=checked]:bg-orange-500"
                                        />
                                    </FormControl>
                                    <FormLabel className="cursor-pointer font-medium text-sm">
                                        Published
                                    </FormLabel>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="flex gap-4 pt-4">
                        <Button type="submit" disabled={form.formState.isSubmitting} className="bg-orange-500 hover:bg-orange-600 text-white font-medium">
                            {form.formState.isSubmitting ? (aboutId ? 'Updating...' : 'Creating...') : (aboutId ? 'Update' : 'Create')}
                        </Button>
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => router.push('/abouts')}
                            className="font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 border-border border"
                        >
                            Cancel
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
