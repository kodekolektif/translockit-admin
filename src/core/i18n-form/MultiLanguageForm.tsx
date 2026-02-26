import { ReactNode } from 'react';
import { useFormContext } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Loader2, Wand2, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/core/api/client';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';

interface MultiLanguageFormProps {
    children: (lang: 'en' | 'es') => ReactNode;
    translateEndpoint?: string; // Endpoint to trigger the translation from the backend
}

export function MultiLanguageForm({
    children,
    translateEndpoint,
}: MultiLanguageFormProps) {
    const { getValues, setValue, formState } = useFormContext();
    const isTranslating = formState.isSubmitting; // Example state, a custom mutation is better

    const handleTranslate = async () => {
        if (!translateEndpoint) return;

        // Assumes translations.en is filled properly
        const enData = getValues('translations.en');

        if (!enData || !enData.title) {
            toast.error('Please fill in the English title first');
            return;
        }

        try {
            toast.info('Translating to Spanish...');
            const { data } = await apiClient.post(translateEndpoint, {
                source: 'en',
                target: 'es',
                text: enData, // backend expects an object of fields to translate
            });

            // Assumes backend returns { title: '...', description: '...' }
            if (data && data.translations) {
                Object.keys(data.translations).forEach(key => {
                    setValue(`translations.es.${key}`, data.translations[key], { shouldValidate: true, shouldDirty: true });
                });
                toast.success('Translation completed');
            }
        } catch (error) {
            toast.error('Failed to translate content');
        }
    };

    const showSpanish = process.env.NEXT_PUBLIC_SHOW_SPANISH_TRANSLATIONS === 'true';

    return (
        <div className="space-y-6">
            <Collapsible defaultOpen className="border border-border/50 rounded-lg bg-card overflow-hidden">
                <CollapsibleTrigger className="flex items-center justify-between w-full p-4 font-semibold text-sm hover:bg-muted/50 transition-colors">
                    English (en)
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </CollapsibleTrigger>
                <CollapsibleContent className="p-4 pt-0 space-y-4">
                    {children('en')}
                </CollapsibleContent>
            </Collapsible>

            {translateEndpoint && showSpanish && (
                <div className="flex">
                    <Button
                        type="button"
                        className="bg-orange-500 hover:bg-orange-600 text-white font-semibold"
                        onClick={handleTranslate}
                        disabled={isTranslating}
                    >
                        {isTranslating ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Wand2 className="mr-2 h-4 w-4" />
                        )}
                        Make spanish translation
                    </Button>
                </div>
            )}

            <Collapsible defaultOpen className="border border-border/50 rounded-lg bg-card overflow-hidden">
                <CollapsibleTrigger className="flex items-center justify-between w-full p-4 font-semibold text-sm hover:bg-muted/50 transition-colors">
                    Spanish (es)
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </CollapsibleTrigger>
                <CollapsibleContent className="p-4 pt-0 space-y-4">
                    {children('es')}
                </CollapsibleContent>
            </Collapsible>
        </div>
    );
}
