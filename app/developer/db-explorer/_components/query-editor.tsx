"use client"

import {
  acceptCompletion,
  autocompletion,
  type Completion,
  type CompletionSource,
  closeBrackets,
  closeBracketsKeymap,
  completionKeymap,
} from "@codemirror/autocomplete"
import { history, historyKeymap } from "@codemirror/commands"
import { SQLite, type SQLNamespace, sql } from "@codemirror/lang-sql"
import {
  bracketMatching,
  HighlightStyle,
  syntaxHighlighting,
} from "@codemirror/language"
import { EditorState } from "@codemirror/state"
import {
  drawSelection,
  EditorView,
  highlightWhitespace,
  keymap,
  lineNumbers,
} from "@codemirror/view"
import { tags } from "@lezer/highlight"
import { Loader2, Play } from "lucide-react"
import { type FC, useCallback, useEffect, useRef } from "react"
import { escapeSqlIdentifier, type TableInfo } from "./types"

type QueryEditorProps = {
  query: string
  tables: TableInfo[]
  queryRunning: boolean
  onQueryChange: (query: string) => void
  onRunQuery: () => void
}

const sqlIdentifierPattern = /^[A-Za-z_][A-Za-z0-9_$]*$/

function buildSqlSchema(tables: TableInfo[]): SQLNamespace {
  return tables.reduce<Record<string, readonly string[]>>((schema, table) => {
    schema[table.name] = table.columns
    return schema
  }, {})
}

function escapeRegularExpression(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

function getSqlIdentifierPatterns(name: string): string[] {
  const patterns = [
    `"${escapeRegularExpression(name.replace(/"/g, '""'))}"`,
    `\`${escapeRegularExpression(name.replace(/`/g, "``"))}\``,
    `\\[${escapeRegularExpression(name.replace(/]/g, "]]"))}\\]`,
  ]

  if (sqlIdentifierPattern.test(name)) {
    patterns.unshift(escapeRegularExpression(name))
  }

  return patterns
}

function getStatementBounds(documentText: string, position: number) {
  const start = documentText.lastIndexOf(";", position - 1) + 1
  const nextStatementIndex = documentText.indexOf(";", position)
  const end =
    nextStatementIndex === -1 ? documentText.length : nextStatementIndex
  return { start, end }
}

type ClauseKind = "select-list" | "where" | "group-by" | "having" | "order-by"

function getClauseContext(statementBeforeCursor: string): ClauseKind | null {
  const clausePattern =
    /\b(select|from|where|group\s+by|having|order\s+by|limit|union|intersect|except)\b/gi
  let lastClause: { kind: string; index: number } | null = null
  let match: RegExpExecArray | null = clausePattern.exec(statementBeforeCursor)

  while (match) {
    lastClause = { kind: match[1].toLowerCase(), index: match.index }
    match = clausePattern.exec(statementBeforeCursor)
  }

  if (!lastClause) return null

  const kind = lastClause.kind.replace(/\s+/g, "-")

  if (
    kind === "select" ||
    kind === "where" ||
    kind === "group-by" ||
    kind === "having" ||
    kind === "order-by"
  ) {
    return kind as ClauseKind
  }

  return null
}

function getReferencedTables(
  statement: string,
  tables: TableInfo[],
): TableInfo[] {
  return tables.filter((table) => {
    const tablePattern = getSqlIdentifierPatterns(table.name).join("|")
    const tableReferencePattern = new RegExp(
      `\\b(?:from|join)\\s+(?:${tablePattern})(?=\\s|,|\\)|;|$)`,
      "i",
    )
    return tableReferencePattern.test(statement)
  })
}

function buildColumnCompletions(tables: TableInfo[]): Completion[] {
  return tables.flatMap((table) =>
    table.columns.map((column) => ({
      label: column,
      type: "property",
      detail: table.name,
      apply: sqlIdentifierPattern.test(column)
        ? undefined
        : escapeSqlIdentifier(column),
      boost: 99,
    })),
  )
}

function createSelectColumnCompletionSource(
  tables: TableInfo[],
): CompletionSource {
  return (context) => {
    const word = context.matchBefore(/[\w$]*/)
    if (!word || (word.from === word.to && !context.explicit)) return null
    if (context.state.sliceDoc(Math.max(0, word.from - 1), word.from) === ".") {
      return null
    }

    const documentText = context.state.doc.toString()
    const { start, end } = getStatementBounds(documentText, context.pos)
    const statementBeforeCursor = documentText.slice(start, context.pos)

    const clauseContext = getClauseContext(statementBeforeCursor)
    if (!clauseContext) return null

    const statement = documentText.slice(start, end)
    const referencedTables = getReferencedTables(statement, tables)
    const completionTables =
      referencedTables.length > 0 ? referencedTables : tables
    const options = buildColumnCompletions(completionTables)

    if (options.length === 0) return null

    return { from: word.from, options, validFor: /^[\w$]*$/ }
  }
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
  ".cm-highlightSpace": {
    backgroundImage:
      "radial-gradient(circle at 50% 55%, #2f353e 20%, transparent 5%) !important",
    backgroundPosition: "center !important",
  },
  ".cm-highlightTab": {
    backgroundImage:
      'url(\'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="20"><path stroke="%232f353e" stroke-width="1" fill="none" d="M1 10H196L190 5M190 15L196 10M197 4L197 16"/></svg>\') !important',
    backgroundSize: "auto 100% !important",
    backgroundPosition: "right 90% !important",
    backgroundRepeat: "no-repeat !important",
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
  tables,
  queryRunning,
  onQueryChange,
  onRunQuery,
}) => {
  const editorRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)
  const isExternalUpdate = useRef(false)
  const onRunQueryRef = useRef(onRunQuery)

  useEffect(() => {
    onRunQueryRef.current = onRunQuery
  }, [onRunQuery])

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

    const runQueryKeymap = keymap.of([
      {
        key: "Mod-Enter",
        run: () => {
          onRunQueryRef.current()
          return true
        },
      },
    ])

    const state = EditorState.create({
      doc: query,
      extensions: [
        drawSelection(),
        highlightWhitespace(),
        devTheme,
        syntaxHighlighting(devHighlightStyle),
        lineNumbers(),
        history(),
        bracketMatching(),
        closeBrackets(),
        sql({ dialect: SQLite, schema: buildSqlSchema(tables) }),
        SQLite.language.data.of({
          autocomplete: createSelectColumnCompletionSource(tables),
        }),
        autocompletion(),
        runQueryKeymap,
        keymap.of([
          {
            key: "Tab",
            run: (view) => {
              if (acceptCompletion(view)) return true
              view.dispatch(view.state.replaceSelection("  "))
              return true
            },
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
    // Schema and completions are intentionally captured at mount; tables don't change after load.
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
          className="flex-1"
        />
        <button
          type="button"
          disabled={queryRunning}
          className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-dev-accent-blue text-white text-sm hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={onRunQuery}
        >
          {queryRunning ? (
            <Loader2
              size={14}
              className="animate-spin"
            />
          ) : (
            <Play size={14} />
          )}
          {queryRunning ? "Running…" : "Run"}
        </button>
      </div>
    </div>
  )
}

export default QueryEditor
