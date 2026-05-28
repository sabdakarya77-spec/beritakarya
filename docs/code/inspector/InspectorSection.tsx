import React from 'react'
import { EditorHelpHint } from '../EditorHelpHint'

export function InspectorSection({
  eyebrow,
  title,
  description,
  helper,
  action,
  children
}: {
  eyebrow: string
  title: string
  description: string
  helper?: string
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="rounded-[28px] border border-gray-200/80 bg-white/95 p-5 shadow-sm dark:border-white/10 dark:bg-slate-950/50">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-gray-500 dark:text-gray-400">{eyebrow}</p>
          <div className="mt-1 flex items-center gap-2">
            <h4 className="text-sm font-semibold text-brand-black dark:text-white">{title}</h4>
            {helper && <EditorHelpHint text={helper} />}
          </div>
          <p className="mt-1 text-xs leading-5 text-gray-500 dark:text-gray-400">{description}</p>
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}

export function FieldLabel({
  children,
  helper
}: {
  children: React.ReactNode
  helper?: string
}) {
  return (
    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-gray-500 dark:text-gray-400">
      <span>{children}</span>
      {helper && <EditorHelpHint text={helper} />}
    </label>
  )
}
