"use client"

import {
  acceptCompletion,
  autocompletion,
  closeBrackets,
  closeBracketsKeymap,
  completionKeymap,
  startCompletion,
} from "@codemirror/autocomplete"
import { history, historyKeymap } from "@codemirror/commands"
import { sql } from "@codemirror/lang-sql"
import {
  bracketMatching,
  HighlightStyle,
  syntaxHighlighting,
} from "@codemirror/language"
import { EditorState } from "@codemirror/state"
import { drawSelection, EditorView, keymap, lineNumbers } from "@codemirror/view"
import { tags } from "@lezer/highlight"
import { Play } from "lucide-react"
import { type FC, useCallback, useEffect, useRef } from "react"

type QueryEditorProps = {
  query: string
  onQueryChange: (query: string) => void
  onRunQuery: () => void
}

const devTheme = EditorView.theme({
  "&": {
    fontSize: "0.875rem",
    backgroundColor: "var(--color-dev-inset)",
    color: "var(--color-dev-text)",
    borderRadius: "0.25rem",
    border: "1px solid var(--color-dev-border)",
  },
  ".cm-content": {
    fontFamily: "monospace",
    padding: "0.5rem 0",
  },
  ".cm-focused": {
    outline: "none",
  },
  ".cm-cursor, .cm-dropCursor": {
    borderLeft: "1.2px solid var(--color-dev-text-secondary) !important",
    width: "0 !important",
    marginLeft: "-0.6px !important",
    backgroundColor: "transparent !important",
    opacity: "0.6",
  },
  "&.cm-focused .cm-cursor": {
    borderLeftColor: "var(--color-dev-text) !important",
    opacity: "1",
  },
  ".cm-gutters": {
    backgroundColor: "var(--color-dev-inset)",
    color: "var(--color-dev-text-secondary)",
    border: "none",
  },
  ".cm-activeLineGutter": {
    backgroundColor: "transparent",
  },
  ".cm-selectionBackground, &.cm-focused .cm-selectionBackground": {
    background: "rgba(83, 155, 245, 0.25) !important",
  },
  ".cm-tooltip": {
    backgroundColor: "var(--color-dev-surface)",
    border: "1px solid var(--color-dev-border)",
    color: "var(--color-dev-text)",
  },
  ".cm-tooltip.cm-tooltip-autocomplete ul li": {
    padding: "2px 8px",
  },
  ".cm-tooltip.cm-tooltip-autocomplete ul li[aria-selected]": {
    background: "var(--color-dev-button-hover)",
    color: "var(--color-dev-text)",
  },
  ".cm-completionLabel": {
    fontFamily: "monospace",
  },
})

const devHighlightStyle = HighlightStyle.define([
  { tag: tags.keyword, color: "var(--color-dev-syntax-keyword)" },
  { tag: tags.string, color: "var(--color-dev-syntax-string)" },
  { tag: tags.number, color: "var(--color-dev-syntax-number)" },
  { tag: tags.bool, color: "var(--color-dev-syntax-boolean)" },
  { tag: tags.null, color: "var(--color-dev-syntax-null)" },
  { tag: tags.propertyName, color: "var(--color-dev-syntax-property)" },
  { tag: tags.punctuation, color: "var(--color-dev-syntax-punctuation)" },
  { tag: tags.comment, color: "var(--color-dev-text-secondary)" },
  { tag: tags.variableName, color: "var(--color-dev-text)" },
])

const QueryEditor: FC<QueryEditorProps> = ({
  query,
  onQueryChange,
  onRunQuery,
}) => {
  const editorRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)
  const isExternalUpdate = useRef(false)
  const onRunQueryRef = useRef(onRunQuery)
  onRunQueryRef.current = onRunQuery

  const runQueryKeymap = keymap.of([
    {
      key: "Mod-Enter",
      run: () => {
        onRunQueryRef.current()
        return true
      },
    },
  ])

  const onUpdate = useCallback(
    (update: {
      docChanged: boolean
      state: { doc: { toString: () => string } }
    }) => {
      if (update.docChanged && !isExternalUpdate.current) {
        onQueryChange(update.state.doc.toString())
      }
    },
    [onQueryChange],
  )

  useEffect(() => {
    if (!editorRef.current) return

    const state = EditorState.create({
      doc: query,
      extensions: [
        drawSelection(),
        devTheme,
        syntaxHighlighting(devHighlightStyle),
        lineNumbers(),
        history(),
        bracketMatching(),
        closeBrackets(),
        sql(),
        autocompletion(),
        runQueryKeymap,
        keymap.of([
          {
            key: "Tab",
            run: (view) => acceptCompletion(view) || startCompletion(view),
          },
          ...closeBracketsKeymap,
          ...historyKeymap,
          ...completionKeymap,
        ]),
        EditorView.updateListener.of(onUpdate),
        EditorView.lineWrapping,
        EditorState.tabSize.of(2),
      ],
    })

    const view = new EditorView({
      state,
      parent: editorRef.current,
    })
    viewRef.current = view

    return () => {
      view.destroy()
      viewRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const view = viewRef.current
    if (!view) return

    const currentDoc = view.state.doc.toString()
    if (currentDoc !== query) {
      isExternalUpdate.current = true
      view.dispatch({
        changes: {
          from: 0,
          to: currentDoc.length,
          insert: query,
        },
      })
      isExternalUpdate.current = false
    }
  }, [query])

  return (
    <div className="border-b border-dev-border p-3">
      <div className="flex items-start gap-2">
        <div
          ref={editorRef}
          className="flex-1 min-h-20"
        />
        <button
          type="button"
          className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-dev-accent-blue text-white text-sm hover:opacity-90 transition-opacity cursor-pointer"
          onClick={onRunQuery}
        >
          <Play size={14} />
          Run
        </button>
      </div>
      <div className="text-xs text-dev-text-secondary mt-1">
        Ctrl+Enter to run
      </div>
    </div>
  )
}

export default QueryEditor
