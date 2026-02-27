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
import { MultiLanguageForm } from '@/core/i18n-form/MultiLanguageForm';
import { ImageDropzone } from '@/core/upload/ImageDropzone';
import { RichEditor } from '@/core/editor/RichEditor';
import { apiClient } from '@/core/api/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQueryClient } from '@tanstack/react-query';
import { clearSessionCacheByPrefix } from '@/core/api/cache';

const authorSchema = z.object({
    profile: z.any().optional(), // Can be string URL or File
    name: z.string().min(1, 'Name is required'),
    title: z.object({
        en: z.string().min(1, 'Title (EN) is required'),
        es: z.string().optional(),
    }),
    description: z.object({
        en: z.string().optional(),
        es: z.string().optional(),
    }),
    social_instagram: z.string().nullable().optional(),
    social_linkedin: z.string().nullable().optional(),
    social_facebook: z.string().nullable().optional(),
    social_twitter: z.string().nullable().optional(),
    lang: z.string().default('en'),
});

type AuthorFormValues = any;

interface AuthorFormProps {
    initialData?: any | null;
    authorId?: string;
}

export function AuthorForm({ initialData, authorId }: AuthorFormProps) {
    const router = useRouter();
    const queryClient = useQueryClient();

    const form = useForm<any>({
        resolver: zodResolver(authorSchema),
        defaultValues: initialData ? {
            ...initialData,
            title: typeof initialData.title === 'string' ? { en: initialData.title, es: '' } : (initialData.title || { en: '', es: '' }),
            description: typeof initialData.description === 'string' ? { en: initialData.description, es: '' } : (initialData.description || { en: '', es: '' }),
            social_instagram: initialData.social_links?.instagram || '',
            social_linkedin: initialData.social_links?.linkedin || '',
            social_facebook: initialData.social_links?.facebook || '',
            social_twitter: initialData.social_links?.twitter || '',
            lang: initialData.lang || 'en',
            profile: initialData.profile || null,
        } : {
            name: '',
            title: { en: '', es: '' },
            description: { en: '', es: '' },
            social_instagram: '',
            social_linkedin: '',
            social_facebook: '',
            social_twitter: '',
            lang: 'en',
            profile: null,
        },
    });

    const onSubmit = async (data: AuthorFormValues) => {
        try {
            const formData = new FormData();
            formData.append('name', data.name);
            formData.append('title[en]', data.title.en);
            if (data.title.es) formData.append('title[es]', data.title.es);
            if (data.description?.en) formData.append('description[en]', data.description.en);
            if (data.description?.es) formData.append('description[es]', data.description.es);

            if (data.social_instagram) formData.append('social_links[instagram]', data.social_instagram);
            if (data.social_linkedin) formData.append('social_links[linkedin]', data.social_linkedin);
            if (data.social_facebook) formData.append('social_links[facebook]', data.social_facebook);
            if (data.social_twitter) formData.append('social_links[twitter]', data.social_twitter);
            formData.append('lang', data.lang || 'en');

            if (data.profile instanceof File) {
                formData.append('profile', data.profile);
            }

            if (initialData && authorId) {
                // Mock edit with spoofed METHOD for Laravel
                formData.append('_method', 'PUT');
                await apiClient.post(`/authors/${authorId}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                toast.success('Author updated successfully');
            } else {
                await apiClient.post('/authors', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                toast.success('Author created successfully');
            }

            clearSessionCacheByPrefix('cache_/authors');
            queryClient.invalidateQueries({ queryKey: ['authors'] });

            router.push('/authors');
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
                            name="profile"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Profile Image</FormLabel>
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

                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name <span className="text-red-500">*</span></FormLabel>
                                    <FormControl>
                                        <Input placeholder="Author's full name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <MultiLanguageForm translateEndpoint="/translate" fieldsToTranslate={['title', 'description']}>
                            {(lang: string) => (
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
                                                        placeholder={`Enter author biography in ${lang.toUpperCase()}`}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </>
                            )}
                        </MultiLanguageForm>

                        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="social_instagram"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Instagram</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Instagram URL" value={field.value || ''} onChange={field.onChange} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="social_linkedin"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>LinkedIn</FormLabel>
                                        <FormControl>
                                            <Input placeholder="LinkedIn URL" value={field.value || ''} onChange={field.onChange} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="social_facebook"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Facebook</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Facebook URL" value={field.value || ''} onChange={field.onChange} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="social_twitter"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Twitter (X)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Twitter URL" value={field.value || ''} onChange={field.onChange} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <Button type="submit" disabled={form.formState.isSubmitting} className="bg-orange-500 hover:bg-orange-600 text-white font-medium">
                            {form.formState.isSubmitting ? (authorId ? 'Updating...' : 'Creating...') : (authorId ? 'Update' : 'Create')}
                        </Button>
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => router.push('/authors')}
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
