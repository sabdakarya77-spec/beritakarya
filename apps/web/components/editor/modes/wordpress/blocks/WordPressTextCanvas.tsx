'use client'

import { forwardRef } from 'react'
import { cn } from '../../../../../lib/utils'

interface WordPressTextCanvasProps {
  onInput: (e: React.FormEvent<HTMLDivElement>) => void
  onBlur: () => void
  onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => void
  onClick: (e: React.MouseEvent<HTMLDivElement>) => void
  onKeyUp: (e: React.KeyboardEvent<HTMLDivElement>) => void
}

/**
 * WordPressTextCanvas — thin wrapper for the continuous contentEditable div.
 *
 * Pegang:
 * - contentEditable
 * - onInput
 * - onBlur
 * - onKeyDown / onKeyUp
 * - onClick
 *
 * Semua styling dipisahkan di sini, tidak bercampur dengan logic editor.
 */
export const WordPressTextCanvas = forwardRef<HTMLDivElement, WordPressTextCanvasProps>(
  function WordPressTextCanvas({ onInput, onBlur, onKeyDown, onClick, onKeyUp }, ref) {
    return (
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        data-placeholder="Mulai menulis..."
        onInput={onInput}
        onKeyDown={onKeyDown}
        onClick={onClick}
        onKeyUp={onKeyUp}
        onBlur={onBlur}
        className={cn(
          "min-h-[400px] outline-none font-serif text-[1.02rem] leading-8 tracking-[0.01em] text-brand-black dark:text-gray-200",
          "lg:text-[1.08rem] lg:leading-[2rem] xl:text-[1.14rem] xl:leading-[2.1rem]",
          "empty:before:content-[attr(data-placeholder)] empty:before:text-gray-300 dark:empty:before:text-white/20 empty:before:pointer-events-none",
          "[&_p]:my-0 [&_p]:py-0",
          "[&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-6 [&_h2]:mb-2",
          "[&_h3]:text-xl [&_h3]:font-semibold [&_h3]:mt-5 [&_h3]:mb-2",
          "[&_blockquote]:border-l-4 [&_blockquote]:border-brand-red [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:my-4",
          "[&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-2",
          "[&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-2",
          "[&_li]:my-1",
          "[&_b]:font-bold [&_strong]:font-bold",
          "[&_i]:italic [&_em]:italic",
          "[&_u]:underline",
          "[&_s]:line-through",
          "[&_a]:text-brand-red [&_a]:underline"
        )}
      />
    )
  }
)