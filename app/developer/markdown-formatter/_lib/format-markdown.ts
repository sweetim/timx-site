import { remark } from "remark"
import remarkGfm from "remark-gfm"

export function formatMarkdown(input: string): string {
  const file = remark().use(remarkGfm).processSync(input)
  return String(file)
}
