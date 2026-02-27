"use client"

import {
  InitialConfigType,
  LexicalComposer,
} from "@lexical/react/LexicalComposer"
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin"
import { EditorState, SerializedEditorState } from "lexical"

import { editorTheme } from "@/components/editor/themes/editor-theme"
import { TooltipProvider } from "@/components/ui/tooltip"

import { nodes } from "./nodes"
import { Plugins } from "./plugins"

const editorConfig: InitialConfigType = {
  namespace: "Editor",
  theme: editorTheme,
  nodes,
  onError: (error: Error) => {
    console.error(error)
  },
}

import { LexicalEditor } from "lexical"

export function Editor({
  editorState,
  editorSerializedState,
  onChange,
  onSerializedChange,
  children,
}: {
  editorState?: EditorState
  editorSerializedState?: SerializedEditorState
  onChange?: (editorState: EditorState, editor: LexicalEditor) => void
  onSerializedChange?: (editorSerializedState: SerializedEditorState) => void
  children?: React.ReactNode
}) {
  return (
    <div className="bg-background overflow-hidden rounded-lg border shadow">
      <LexicalComposer
        initialConfig={{
          ...editorConfig,
          ...(editorState ? { editorState } : {}),
          ...(editorSerializedState
            ? { editorState: JSON.stringify(editorSerializedState) }
            : {}),
        }}
      >
        <TooltipProvider>
          <Plugins />

          <OnChangePlugin
            ignoreSelectionChange={true}
            onChange={(editorState, editor) => {
              onChange?.(editorState, editor)
              onSerializedChange?.(editorState.toJSON())
            }}
          />
          {children}
        </TooltipProvider>
      </LexicalComposer>
    </div>
  )
}
