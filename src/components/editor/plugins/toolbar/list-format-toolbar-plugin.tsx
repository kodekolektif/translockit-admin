"use client"

import {
    INSERT_ORDERED_LIST_COMMAND,
    INSERT_UNORDERED_LIST_COMMAND,
    REMOVE_LIST_COMMAND,
} from "@lexical/list"
import { ListIcon, ListOrderedIcon } from "lucide-react"

import { useToolbarContext } from "@/components/editor/context/toolbar-context"
import {
    ToggleGroup,
    ToggleGroupItem,
} from "@/components/ui/toggle-group"

export function ListFormatToolbarPlugin() {
    const { activeEditor, blockType } = useToolbarContext()

    const handleValueChange = (value: string) => {
        // If we click an active toggle, value comes back empty, so we remove the list format
        if (!value) {
            activeEditor.dispatchCommand(REMOVE_LIST_COMMAND, undefined)
            return
        }

        if (value === "bullet") {
            activeEditor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)
        } else if (value === "number") {
            activeEditor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)
        }
    }

    // Determine active state for toggles based on current blockType ("bullet" or "number")
    const activeValue = ["bullet", "number"].includes(blockType) ? blockType : ""

    return (
        <ToggleGroup
            type="single"
            value={activeValue}
            onValueChange={handleValueChange}
        >
            <ToggleGroupItem
                value="bullet"
                variant="outline"
                size="sm"
                aria-label="Bulleted List"
            >
                <ListIcon className="size-4" />
            </ToggleGroupItem>

            <ToggleGroupItem
                value="number"
                variant="outline"
                size="sm"
                aria-label="Numbered List"
            >
                <ListOrderedIcon className="size-4" />
            </ToggleGroupItem>
        </ToggleGroup>
    )
}
