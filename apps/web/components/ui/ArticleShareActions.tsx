'use client';

import { useMemo, useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { SiFacebook, SiTelegram, SiWhatsapp, SiX } from 'react-icons/si';
import { cn } from '../../lib/utils';
import { getArticleShareItems } from '../../lib/articleShare';

type ArticleShareActionsProps = {
  title: string;
  url: string;
  className?: string;
};

const ICON_MAP = {
  Facebook: SiFacebook,
  X: SiX,
  Telegram: SiTelegram,
  WhatsApp: SiWhatsapp,
} as const;

const HOVER_MAP = {
  Facebook: 'hover:text-[#1877F2] hover:border-[#1877F2]/40',
  X: 'hover:text-white hover:border-white/40',
  Telegram: 'hover:text-[#229ED9] hover:border-[#229ED9]/40',
  WhatsApp: 'hover:text-[#25D366] hover:border-[#25D366]/40',
} as const;

export default function ArticleShareActions({ title, url, className }: ArticleShareActionsProps) {
  const [isCopied, setIsCopied] = useState(false);
  const items = useMemo(() => getArticleShareItems(title, url), [title, url]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url);
    setIsCopied(true);
    window.setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      {items.map((item) => {
        const Icon = ICON_MAP[item.label];

        return (
          <a
            key={item.label}
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Bagikan ke ${item.label}`}
            title={`Bagikan ke ${item.label}`}
            className={cn(
              'inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-brand-text-muted transition-all dark:border-white/10 dark:bg-white/[0.03] dark:text-gray-300',
              HOVER_MAP[item.label]
            )}
          >
            <Icon className="text-sm" />
          </a>
        );
      })}

      <button
        type="button"
        onClick={handleCopy}
        aria-label="Salin tautan artikel"
        title={isCopied ? 'Tautan tersalin' : 'Salin tautan artikel'}
        className={cn(
          'inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-brand-text-muted transition-all dark:border-white/10 dark:bg-white/[0.03] dark:text-gray-300',
          isCopied
            ? 'border-emerald-500/40 text-emerald-500'
            : 'hover:text-brand-red hover:border-brand-red/40'
        )}
      >
        {isCopied ? <Check size={16} /> : <Copy size={16} />}
      </button>
    </div>
  );
}
