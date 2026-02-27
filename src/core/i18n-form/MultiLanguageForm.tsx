import { ReactNode, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Loader2, Wand2, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/core/api/client';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';

interface MultiLanguageFormProps {
    children: (lang: 'en' | 'es') => ReactNode;
    translateEndpoint?: string; // Endpoint to trigger the translation from the backend
    fieldsToTranslate?: string[]; // Array of fields to translate, e.g. ['title', 'content']
}

export function MultiLanguageForm({
    children,
    translateEndpoint = '/translate', // Default to /translate
    fieldsToTranslate = [],
}: MultiLanguageFormProps) {
    const { getValues, setValue } = useFormContext();
    const [isTranslating, setIsTranslating] = useState(false);

    const handleTranslate = async () => {
        if (!translateEndpoint || fieldsToTranslate.length === 0) return;

        setIsTranslating(true);

        try {
            const payloadData: { key: string; value: string }[] = [];

            fieldsToTranslate.forEach(field => {
                const enValue = getValues(`${field}.en`);
                if (enValue) {
                    payloadData.push({ key: field, value: enValue });
                }
            });

            if (payloadData.length === 0) {
                toast.error('Please fill in the English fields first');
                setIsTranslating(false);
                return;
            }

            toast.info('Translating to Spanish...');
            const { data } = await apiClient.post(translateEndpoint, {
                target_lang: 'es',
                data: payloadData,
            });

            if (data && data.success && data.data && data.data.translations) {
                data.data.translations.forEach((t: any) => {
                    setValue(`${t.key}.es`, t.translated_text, { shouldValidate: true, shouldDirty: true });
                });
                toast.success('Translation completed');
            } else {
                toast.error('Failed to translate content: Invalid response');
            }
        } catch (error) {
            toast.error('Failed to translate content');
        } finally {
            setIsTranslating(false);
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
