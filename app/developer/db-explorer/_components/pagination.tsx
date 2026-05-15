"use client"

import type { FC } from "react"

type PaginationProps = {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

const Pagination: FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => (
  <div className="flex items-center justify-center gap-2 py-2 border-t border-dev-border text-sm text-dev-text-secondary">
    <button
      type="button"
      className="px-2 py-1 rounded bg-dev-button hover:bg-dev-button-hover transition-colors cursor-pointer text-dev-text disabled:opacity-40 disabled:cursor-default"
      disabled={currentPage === 0}
      onClick={() => onPageChange(currentPage - 1)}
    >
      Prev
    </button>
    <span>
      {currentPage + 1} / {totalPages}
    </span>
    <button
      type="button"
      className="px-2 py-1 rounded bg-dev-button hover:bg-dev-button-hover transition-colors cursor-pointer text-dev-text disabled:opacity-40 disabled:cursor-default"
      disabled={currentPage >= totalPages - 1}
      onClick={() => onPageChange(currentPage + 1)}
    >
      Next
    </button>
  </div>
)

export default Pagination
