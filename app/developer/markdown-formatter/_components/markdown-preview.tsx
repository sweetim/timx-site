import clsx from "clsx"
import type { FC } from "react"
import Markdown from "react-markdown"
import remarkGfm from "remark-gfm"

type MarkdownPreviewProps = {
  content: string
  className?: string
}

const PREVIEW_STYLES = [
  "text-dev-text text-sm leading-relaxed",
  "[&_h1]:text-lg [&_h1]:font-semibold [&_h1]:mt-4 [&_h1]:mb-2",
  "[&_h2]:text-base [&_h2]:font-semibold [&_h2]:mt-4 [&_h2]:mb-2",
  "[&_h3]:text-sm [&_h3]:font-semibold [&_h3]:mt-3 [&_h3]:mb-1",
  "[&_h4]:text-sm [&_h4]:font-semibold [&_h4]:mt-2 [&_h4]:mb-1",
  "[&_p]:my-2",
  "[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-2",
  "[&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-2",
  "[&_li]:my-0.5",
  "[&_a]:text-dev-link [&_a]:underline",
  "[&_code]:bg-dev-inset [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&_code]:font-mono",
  "[&_pre]:bg-dev-inset [&_pre]:p-3 [&_pre]:rounded [&_pre]:overflow-auto [&_pre]:my-2",
  "[&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-sm",
  "[&_blockquote]:border-l-2 [&_blockquote]:border-dev-border-muted [&_blockquote]:pl-3 [&_blockquote]:text-dev-text-secondary [&_blockquote]:my-2",
  "[&_table]:border-collapse [&_table]:my-3 [&_table]:w-full",
  "[&_th]:border [&_th]:border-dev-border [&_th]:px-2 [&_th]:py-1 [&_th]:text-left [&_th]:bg-dev-button [&_th]:font-medium",
  "[&_td]:border [&_td]:border-dev-border [&_td]:px-2 [&_td]:py-1",
  "[&_hr]:border-dev-border [&_hr]:my-4",
  "[&_img]:max-w-full",
]

const MarkdownPreview: FC<MarkdownPreviewProps> = ({ content, className }) => {
  return (
    <div className={clsx(PREVIEW_STYLES, className)}>
      <Markdown remarkPlugins={[remarkGfm]}>{content}</Markdown>
    </div>
  )
}

export default MarkdownPreview
