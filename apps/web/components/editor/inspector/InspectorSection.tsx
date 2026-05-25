import React from 'react'

export function InspectorSection({
  eyebrow,
  title,
  description,
  action,
  children
}: {
  eyebrow: string
  title: string
  description: string
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="rounded-[28px] border border-gray-200/80 bg-white/95 p-5 shadow-sm dark:border-white/10 dark:bg-slate-950/50">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-gray-500 dark:text-gray-400">{eyebrow}</p>
          <h4 className="mt-1 text-sm font-semibold text-brand-black dark:text-white">{title}</h4>
          <p className="mt-1 text-xs leading-5 text-gray-500 dark:text-gray-400">{description}</p>
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}

export function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-[10px] font-black uppercase tracking-[0.22em] text-gray-500 dark:text-gray-400">
      {children}
    </label>
  )
}
