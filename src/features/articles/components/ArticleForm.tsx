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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

const articleSchema = z.object({
    thumbnail: z.any().optional(), // Can be string URL or File
    is_published: z.boolean().default(true),
    title: z.object({
        en: z.string().min(1, 'Title (EN) is required'),
        es: z.string().optional(),
    }),
    content: z.object({
        en: z.string().min(1, 'Content (EN) is required'),
        es: z.string().optional(),
    }),
    lang: z.string().default('en'),
    category_id: z.string().optional().nullable(),
    author_id: z.string().optional().nullable(),
    tags: z.array(z.string()).optional().default([]),
});

type ArticleFormValues = any; // Bypass strict TS checks for dynamic dynamic schemas

interface ArticleFormProps {
    initialData?: ArticleFormValues | null;
    articleId?: string;
}

export function ArticleForm({ initialData, articleId }: ArticleFormProps) {
    const router = useRouter();

    const [categories, setCategories] = useState<any[]>([]);
    const [authors, setAuthors] = useState<any[]>([]);
    const [tagInput, setTagInput] = useState('');

    useEffect(() => {
        const fetchCategoriesAndAuthors = async () => {
            try {
                // Adjust endpoints as necessary to match your API for fetching lists
                const [catsRes, authsRes] = await Promise.all([
                    apiClient.get('/category'),
                    apiClient.get('/authors'),
                ]);
                setCategories(catsRes.data?.data || catsRes.data || []);
                setAuthors(authsRes.data?.data || authsRes.data || []);
            } catch (error) {
                console.error('Failed to fetch categories or authors:', error);
            }
        };

        fetchCategoriesAndAuthors();
    }, []);

    const form = useForm<any>({
        resolver: zodResolver(articleSchema),
        defaultValues: initialData ? {
            ...initialData,
            title: typeof initialData.title === 'string' ? { en: initialData.title, es: '' } : (initialData.title || { en: '', es: '' }),
            content: typeof initialData.content === 'string' ? { en: initialData.content, es: '' } : (initialData.content || { en: '', es: '' }),
            is_published: initialData.is_published ?? true,
            thumbnail: initialData.thumbnail || null,
            lang: initialData.lang || 'en',
            category_id: initialData.category?.id || initialData.category_id || '',
            author_id: initialData.author?.id || initialData.author_id || '',
            tags: initialData.tags || [],
        } : {
            is_published: true,
            title: { en: '', es: '' },
            content: { en: '', es: '' },
            lang: 'en',
            category_id: '',
            author_id: '',
            tags: [],
        },
    });

    const onSubmit = async (data: ArticleFormValues) => {
        try {
            const formData = new FormData();
            formData.append('is_published', data.is_published ? '1' : '0');
            formData.append('title[en]', data.title.en);
            if (data.title.es) formData.append('title[es]', data.title.es);
            formData.append('content[en]', data.content.en);
            if (data.content.es) formData.append('content[es]', data.content.es);
            formData.append('lang', data.lang || 'en');
            if (data.category_id) formData.append('category_id', data.category_id);
            if (data.author_id) formData.append('author_id', data.author_id);

            if (data.tags && data.tags.length > 0) {
                data.tags.forEach((tag: string, index: number) => {
                    formData.append(`tags[${index}]`, tag);
                });
            }

            if (data.thumbnail instanceof File) {
                formData.append('thumbnail', data.thumbnail);
            }

            if (initialData && articleId) {
                // Mock edit with spoofed METHOD for Laravel
                formData.append('_method', 'PUT');
                await apiClient.post(`/articles/${articleId}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                toast.success('Article updated effectively');
            } else {
                await apiClient.post('/articles', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                toast.success('Article created effectively');
            }

            router.push('/articles');
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
                            name="thumbnail"
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

                        <MultiLanguageForm translateEndpoint="/translate/articles">
                            {(lang) => (
                                <>
                                    <FormField
                                        control={form.control}
                                        name={`title.${lang}` as const}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Title ({lang.toUpperCase()})</FormLabel>
                                                <FormControl>
                                                    <Input placeholder={`Enter article title in ${lang.toUpperCase()}`} {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name={`content.${lang}` as const}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Content ({lang.toUpperCase()})</FormLabel>
                                                <FormControl>
                                                    <RichEditor
                                                        value={field.value}
                                                        onChange={field.onChange}
                                                        placeholder={`Enter rich text content in ${lang.toUpperCase()}`}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </>
                            )}
                        </MultiLanguageForm>

                        <div className="flex flex-col gap-8">
                            <FormField
                                control={form.control}
                                name="category_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Category</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value || ''}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a category" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {categories.map((cat) => (
                                                    <SelectItem key={cat.id} value={cat.id.toString()}>
                                                        {cat.name || cat.translations?.en?.title || 'Unknown'}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="author_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Author</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value || ''}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select an author" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {authors.map((author) => (
                                                    <SelectItem key={author.id} value={author.id.toString()}>
                                                        {author.name || 'Unknown'}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="tags"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tags</FormLabel>
                                    <div className="flex flex-col gap-2 relative">
                                        <div className="flex flex-wrap gap-2 mb-2 max-w-full">
                                            {field.value?.map((tag: string, index: number) => (
                                                <span key={index} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    {tag}
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const newTags = [...field.value];
                                                            newTags.splice(index, 1);
                                                            field.onChange(newTags);
                                                        }}
                                                        className="hover:bg-blue-200 rounded-full p-0.5"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                        <Input
                                            placeholder="Type a tag and press Enter"
                                            value={tagInput}
                                            onChange={(e) => setTagInput(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    const newTag = tagInput.trim();
                                                    if (newTag && !field.value?.includes(newTag)) {
                                                        field.onChange([...(field.value || []), newTag]);
                                                        setTagInput('');
                                                    }
                                                }
                                            }}
                                        />
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="is_published"
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
                            {form.formState.isSubmitting ? 'Saving...' : 'Save'}
                        </Button>
                        {/* <Button type="button" variant="secondary" className="font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 border-border border">
                            Save & create another
                        </Button> */}
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => router.push('/articles')}
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
