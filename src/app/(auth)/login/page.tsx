'use client';

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/core/api/client';
import { toast } from 'sonner';

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
    remember: z.boolean().default(false),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema) as any,
        defaultValues: {
            email: '',
            password: '',
            remember: false,
        },
    });

    useEffect(() => {
        const savedEmail = localStorage.getItem('translockit_email');
        if (savedEmail) {
            form.setValue('email', savedEmail);
            form.setValue('remember', true);
        }
    }, [form]);

    const onSubmit = async (data: LoginFormValues) => {
        setLoading(true);
        try {
            // 1. Perform Login Request
            const payload = {
                ...data,
                is_remember: data.remember ? 1 : 0
            };
            const response = await apiClient.post('/login', payload);

            // 2. Extract and store the access token and user
            const resultData = response.data?.data || response.data;
            if (resultData?.access_token) {
                localStorage.setItem('access_token', resultData.access_token);
            }
            if (resultData?.user) {
                localStorage.setItem('translockit_user', JSON.stringify(resultData.user));
            }

            if (data.remember) {
                localStorage.setItem('translockit_email', data.email);
            } else {
                localStorage.removeItem('translockit_email');
            }

            toast.success('Logged in successfully');

            // 3. Redirect to dashboard
            router.push('/dashboard');
            router.refresh(); // Refresh the router instance to ensure client side fetch applies correctly 
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Failed to login');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative flex h-screen w-full items-center justify-center bg-gray-50 overflow-hidden">
            {/* Animated Background */}
            <div className="rainbow">
                {Array.from({ length: 25 }).map((_, i) => (
                    <div key={i} />
                ))}
            </div>
            <div className="rainbow-h"></div>
            <div className="rainbow-v"></div>

            {/* Login Form Card */}
            <Card className="z-10 w-full max-w-md shadow-2xl backdrop-blur-sm bg-white/95 text-center">
                <CardHeader className="space-y-2 items-center">
                    <div className="flex w-full items-center justify-center">
                        <img src="/translockit.png" alt="Translock IT Logo" className="h-24 w-auto object-contain mx-auto" />
                    </div>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input placeholder="admin@example.com" {...field} disabled={loading} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="********" {...field} disabled={loading} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="remember"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-1">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                                disabled={loading}
                                            />
                                        </FormControl>
                                        <div className="space-y-1 leading-none text-left">
                                            <FormLabel>
                                                Remember me
                                            </FormLabel>
                                        </div>
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full mt-6" size="lg" disabled={loading}>
                                {loading ? 'Logging in...' : 'Sign In'}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
