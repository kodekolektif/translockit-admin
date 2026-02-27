"use client"

import { useCallback, useEffect, useState } from "react"
import {
    CAN_REDO_COMMAND,
    CAN_UNDO_COMMAND,
    COMMAND_PRIORITY_CRITICAL,
    REDO_COMMAND,
    UNDO_COMMAND,
} from "lexical"
import { RedoIcon, UndoIcon } from "lucide-react"
import { mergeRegister } from "@lexical/utils"

import { useToolbarContext } from "@/components/editor/context/toolbar-context"
import { Button } from "@/components/ui/button"

export function HistoryToolbarPlugin() {
    const { activeEditor } = useToolbarContext()
    const [canUndo, setCanUndo] = useState(false)
    const [canRedo, setCanRedo] = useState(false)

    useEffect(() => {
        return mergeRegister(
            activeEditor.registerCommand<boolean>(
                CAN_UNDO_COMMAND,
                (payload) => {
                    setCanUndo(payload)
                    return false
                },
                COMMAND_PRIORITY_CRITICAL
            ),
            activeEditor.registerCommand<boolean>(
                CAN_REDO_COMMAND,
                (payload) => {
                    setCanRedo(payload)
                    return false
                },
                COMMAND_PRIORITY_CRITICAL
            )
        )
    }, [activeEditor])

    return (
        <div className="flex items-center gap-1">
            <Button
                variant="ghost"
                size="icon-sm"
                disabled={!canUndo}
                onClick={() => {
                    activeEditor.dispatchCommand(UNDO_COMMAND, undefined)
                }}
                aria-label="Undo"
                type="button"
            >
                <UndoIcon className="size-4" />
            </Button>
            <Button
                variant="ghost"
                size="icon-sm"
                disabled={!canRedo}
                onClick={() => {
                    activeEditor.dispatchCommand(REDO_COMMAND, undefined)
                }}
                aria-label="Redo"
                type="button"
            >
                <RedoIcon className="size-4" />
            </Button>
        </div>
    )
}
