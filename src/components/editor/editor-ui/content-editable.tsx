import { JSX } from "react"
import { ContentEditable as LexicalContentEditable } from "@lexical/react/LexicalContentEditable"

type Props = {
  placeholder: string
  className?: string
  placeholderClassName?: string
}

export function ContentEditable({
  placeholder,
  className,
  placeholderClassName,
}: Props): JSX.Element {
  return (
    <LexicalContentEditable
      className={
        className ??
        `ContentEditable__root prose prose-sm max-w-none relative block min-h-72 min-h-full overflow-auto px-4 py-4 focus:outline-none`
      }
      aria-placeholder={placeholder}
      placeholder={
        <div
          className={
            placeholderClassName ??
            `text-muted-foreground pointer-events-none absolute top-0 left-0 overflow-hidden px-4 py-4 text-ellipsis select-none`
          }
        >
          {placeholder}
        </div>
      }
    />
  )
}
