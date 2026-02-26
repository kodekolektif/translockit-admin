import { Metadata } from 'next';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { AuthorForm } from '@/features/authors/components/AuthorForm';

export const metadata: Metadata = {
    title: 'Create Author | Admin Dashboard',
    description: 'Add a new author to your website.',
};

export default function CreateAuthorPage() {
    return (
        <div className="space-y-6 max-w-5xl mx-auto py-6">
            <div className="space-y-2">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/authors">Authors</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>Create</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
                <h2 className="text-3xl font-bold tracking-tight">Create Author</h2>
            </div>
            <AuthorForm />
        </div>
    );
}
