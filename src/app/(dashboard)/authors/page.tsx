import { Metadata } from 'next';
import { AuthorsList } from '@/features/authors/components/AuthorsList';

export const metadata: Metadata = {
    title: 'Authors Management | Admin Dashboard',
    description: 'Manage authors for your website content.',
};

export default function AuthorsPage() {
    return (
        <div className="space-y-6">
            <AuthorsList />
        </div>
    );
}
