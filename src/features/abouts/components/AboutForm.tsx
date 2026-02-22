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

const translationSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().min(1, 'Description is required'),
});

const aboutSchema = z.object({
    image: z.any().optional(), // Can be string URL or File
    published: z.boolean().default(true),
    translations: z.object({
        en: translationSchema,
        es: translationSchema.default({ title: '', description: '' }),
    }),
});

type AboutFormValues = any; // Bypass strict TS checks for dynamic dynamic schemas

interface AboutFormProps {
    initialData?: AboutFormValues | null;
    aboutId?: number;
}

export function AboutForm({ initialData, aboutId }: AboutFormProps) {
    const router = useRouter();

    const form = useForm<any>({
        resolver: zodResolver(aboutSchema),
        defaultValues: initialData || {
            published: true,
            translations: {
                en: { title: '', description: '' },
                es: { title: '', description: '' },
            },
        },
    });

    const onSubmit = async (data: AboutFormValues) => {
        try {
            const formData = new FormData();
            formData.append('published', data.published ? '1' : '0');

            if (data.image instanceof File) {
                formData.append('image', data.image);
            }

            // Arrays/Objects in FormData for Laravel
            Object.keys(data.translations).forEach((lang) => {
                const tr = data.translations[lang as 'en' | 'es'];
                if (tr) {
                    formData.append(`translations[${lang}][title]`, tr.title);
                    formData.append(`translations[${lang}][description]`, tr.description || '');
                }
            });

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

                        <MultiLanguageForm translateEndpoint="/translate/abouts">
                            {(lang) => (
                                <>
                                    <FormField
                                        control={form.control}
                                        name={`translations.${lang}.title` as const}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Title</FormLabel>
                                                <FormControl>
                                                    <Input placeholder={`Title in ${lang.toUpperCase()}`} {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name={`translations.${lang}.description` as const}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Description</FormLabel>
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
                            name="published"
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
                            {form.formState.isSubmitting ? 'Creating...' : 'Create'}
                        </Button>
                        <Button type="button" variant="secondary" className="font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 border-border border">
                            Create & create another
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
