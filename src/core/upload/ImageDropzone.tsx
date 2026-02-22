'use client';

import { useCallback, useState } from 'react';
import { useDropzone, DropzoneOptions } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { X, UploadCloud, File, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';

interface DropzoneProps extends Omit<DropzoneOptions, 'onDrop'> {
    value?: File | string | null;
    onChange: (file: File | null) => void;
    accept?: Record<string, string[]>;
    maxSize?: number;
}

export function ImageDropzone({ value, onChange, accept, maxSize }: DropzoneProps) {
    const [preview, setPreview] = useState<string | null>(
        typeof value === 'string' ? value : value ? URL.createObjectURL(value) : null
    );

    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            const file = acceptedFiles[0];
            if (file) {
                onChange(file);
                setPreview(URL.createObjectURL(file));
            }
        },
        [onChange]
    );

    const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
        onDrop,
        accept: accept || { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
        maxSize: maxSize || 5242880, // 5MB limit
        multiple: false,
    });

    const removeFile = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange(null);
        setPreview(null);
    };

    return (
        <div className="w-full">
            {preview ? (
                <div className="relative group w-full rounded-md border aspect-video overflow-hidden">
                    {/* Attempt to render preview or fallback icon */}
                    <img src={preview} alt="Upload preview" className="object-cover w-full h-full" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button type="button" variant="destructive" size="icon" onClick={removeFile}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            ) : (
                <div
                    {...getRootProps()}
                    className={`
            border-2 border-dashed rounded-md p-10 cursor-pointer flex flex-col items-center justify-center text-center
            transition-colors duration-200 ease-in-out
            ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'}
            ${isDragReject ? 'border-destructive bg-destructive/10' : ''}
          `}
                >
                    <input {...getInputProps()} />
                    <UploadCloud className="h-10 w-10 text-muted-foreground mb-4" />
                    {isDragActive ? (
                        <p className="text-sm font-medium">Drop the image here ...</p>
                    ) : (
                        <div className="space-y-1">
                            <p className="text-sm font-medium">Drag & drop an image here, or click to select</p>
                            <p className="text-xs text-muted-foreground">PNG, JPG or WEBP (max. 5MB)</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
