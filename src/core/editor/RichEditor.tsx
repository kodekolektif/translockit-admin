'use client';

import { useEffect, useRef } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';
import { $getRoot, $insertNodes } from 'lexical';
import { Editor } from '@/components/blocks/editor-00/editor';

interface RichEditorProps {
    value?: string;
    onChange: (value?: string) => void;
    placeholder?: string;
}

function LexicalHtmlPlugin({ initialHtml }: { initialHtml?: string }) {
    const [editor] = useLexicalComposerContext();
    const isInitialized = useRef(false);

    useEffect(() => {
        if (!initialHtml || isInitialized.current) return;
        isInitialized.current = true;

        editor.update(() => {
            const parser = new DOMParser();
            const dom = parser.parseFromString(initialHtml, 'text/html');
            const nodes = $generateNodesFromDOM(editor, dom);

            // Append the nodes to the root
            const root = $getRoot();
            root.clear(); // Clear default empty paragraph
            root.select();
            $insertNodes(nodes);
        });
    }, [editor, initialHtml]);

    return null;
}

export function RichEditor({ value, onChange, placeholder }: RichEditorProps) {
    return (
        <div className="min-h-[150px] w-full">
            <Editor
                onChange={(editorState, editor) => {
                    editorState.read(() => {
                        const html = $generateHtmlFromNodes(editor, null);
                        // The default empty Lexical editor generates `<p dir="ltr"><br></p>`
                        if (html === '<p dir="ltr"><br></p>' || html === '<p><br></p>') {
                            onChange('');
                        } else {
                            onChange(html);
                        }
                    });
                }}
            >
                <LexicalHtmlPlugin initialHtml={value} />
            </Editor>
        </div>
    );
}
