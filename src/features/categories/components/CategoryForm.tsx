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
import { apiClient } from '@/core/api/client';
import { MultiLanguageForm } from '@/core/i18n-form/MultiLanguageForm';
const categorySchema = z.object({
    name: z.object({
        en: z.string().min(1, 'English name is required'),
        es: z.string().optional(),
    }),
    is_active: z.boolean(),
    lang: z.string(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

interface CategoryFormProps {
    initialData?: CategoryFormValues | null;
    categoryId?: string;
}

export function CategoryForm({ initialData, categoryId }: CategoryFormProps) {
    const router = useRouter();

    const form = useForm<CategoryFormValues>({
        resolver: zodResolver(categorySchema),
        defaultValues: initialData ? {
            ...initialData,
            name: typeof initialData.name === 'string' ? { en: initialData.name, es: '' } : (initialData.name || { en: '', es: '' }),
            is_active: initialData.is_active ?? true,
            lang: initialData.lang || 'en',
        } : {
            name: { en: '', es: '' },
            is_active: true,
            lang: 'en',
        },
    });

    const onSubmit = async (data: CategoryFormValues) => {
        try {
            const formData = new FormData();
            formData.append('name[en]', data.name.en);
            if (data.name.es) formData.append('name[es]', data.name.es);
            formData.append('is_active', data.is_active ? '1' : '0');
            formData.append('lang', data.lang || 'en');

            if (initialData && categoryId) {
                formData.append('_method', 'PUT'); // Spoof PUT for Laravel when using FormData
                await apiClient.post(`/categories/${categoryId}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                toast.success('Category updated successfully');
            } else {
                await apiClient.post('/categories', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                toast.success('Category created successfully');
            }

            router.push('/categories');
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

                        <MultiLanguageForm translateEndpoint="/translate/categories">
                            {(lang: string) => (
                                <FormField
                                    control={form.control}
                                    name={`name.${lang}` as any}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Name ({lang.toUpperCase()}) {lang === 'en' && <span className="text-red-500">*</span>}</FormLabel>
                                            <FormControl>
                                                <Input placeholder={`Category name in ${lang.toUpperCase()}`} {...field} value={field.value as string || ''} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
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
                                        Active
                                    </FormLabel>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                    </div>

                    <div className="flex gap-4 pt-4">
                        <Button type="submit" disabled={form.formState.isSubmitting} className="bg-orange-500 hover:bg-orange-600 text-white font-medium">
                            {form.formState.isSubmitting ? (categoryId ? 'Updating...' : 'Creating...') : (categoryId ? 'Update' : 'Create')}
                        </Button>
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => router.push('/categories')}
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
