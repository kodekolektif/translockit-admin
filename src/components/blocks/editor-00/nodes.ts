import { HeadingNode, QuoteNode } from "@lexical/rich-text"
import {
  Klass,
  LexicalNode,
  LexicalNodeReplacement,
  ParagraphNode,
  TextNode,
} from "lexical"

import { ListNode, ListItemNode } from "@lexical/list"

export const nodes: ReadonlyArray<Klass<LexicalNode> | LexicalNodeReplacement> =
  [HeadingNode, ParagraphNode, TextNode, QuoteNode, ListNode, ListItemNode]
