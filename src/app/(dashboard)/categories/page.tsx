import { CategoriesList } from '@/features/categories/components/CategoriesList';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Categories | Admin',
};

export default function CategoriesPage() {
    return (
        <div className="space-y-6">
            <CategoriesList />
        </div>
    );
}
