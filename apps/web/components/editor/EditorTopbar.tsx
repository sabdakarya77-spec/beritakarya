'use client';

import { useEditorStore } from '../../store/editorStore';
import { useAuthStore } from '../../store/authStore';
import { 
  Save, 
  Send, 
  Settings, 
  CheckCircle2, 
  History,
  MoreHorizontal,
  Maximize2,
  Minimize2,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { EditorHelpHint } from './EditorHelpHint';

const STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  submitted: 'Dikirim',
  review: 'Review',
  revision: 'Revisi',
  approved: 'Disetujui',
  scheduled: 'Terjadwal',
  published: 'Terbit'
};

const STATUS_HELPERS: Record<string, string> = {
  draft: 'Artikel masih dalam tahap penulisan dan belum dikirim untuk review.',
  submitted: 'Artikel telah dikirim dan menunggu tanggapan dari redaksi.',
  review: 'Artikel sedang dalam proses pemeriksaan oleh redaktur.',
  revision: 'Artikel perlu direvisi sesuai catatan dari redaktur.',
  approved: 'Artikel telah disetujui dan siap untuk diterbitkan.',
  scheduled: 'Artikel dijadwalkan untuk terbit pada waktu tertentu.',
  published: 'Artikel sudah terbit dan visible untuk pembaca.'
};

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-500 border-gray-200',
  submitted: 'bg-blue-50 text-blue-600 border-blue-200',
  review: 'bg-violet-50 text-violet-600 border-violet-200',
  revision: 'bg-orange-50 text-orange-600 border-orange-200',
  approved: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  scheduled: 'bg-cyan-50 text-cyan-600 border-cyan-200',
  published: 'bg-green-50 text-green-600 border-green-200'
};

function getSaveStatusLabel({
  saving,
  saveError,
  lastSaved
}: {
  saving: boolean
  saveError: string | null
  lastSaved: Date | null
}) {
  if (saving) return 'Menyimpan otomatis...';
  if (saveError) return 'Gagal simpan';
  if (lastSaved) return `Tersimpan ${lastSaved.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`;
  return 'Belum disimpan';
}

function getPrimaryAction(status: string, isEditor: boolean, missingCount: number) {
  const hasMissing = missingCount > 0;

  if (!isEditor) {
    if (status === 'draft' || status === 'revision') {
      return {
        label: hasMissing ? 'Belum Lengkap' : 'Kirim Review',
        disabled: hasMissing,
        tone: hasMissing ? 'neutral' as const : 'danger' as const
      };
    }

    if (status === 'submitted' || status === 'review') {
      return {
        label: 'Menunggu Review',
        disabled: true,
        tone: 'neutral' as const
      };
    }

    if (status === 'approved') {
      return {
        label: 'Siap Diterbitkan',
        disabled: true,
        tone: 'success' as const
      };
    }

    if (status === 'published') {
      return {
        label: 'Sudah Terbit',
        disabled: true,
        tone: 'success' as const
      };
    }

    return {
      label: hasMissing ? 'Belum Lengkap' : 'Kirim Review',
      disabled: hasMissing,
      tone: hasMissing ? 'neutral' as const : 'danger' as const
    };
  }

  if (status === 'approved') {
    return {
      label: hasMissing ? 'Belum Lengkap' : 'Terbitkan',
      disabled: hasMissing,
      tone: hasMissing ? 'neutral' as const : 'danger' as const
    };
  }

  if (status === 'scheduled') {
    return {
      label: 'Terbitkan Sekarang',
      disabled: false,
      tone: 'danger' as const
    };
  }

  if (status === 'published') {
    return {
      label: 'Sudah Terbit',
      disabled: true,
      tone: 'success' as const
    };
  }

  return {
    label: 'Belum Siap Terbit',
    disabled: true,
    tone: 'neutral' as const
  };
}

export function EditorTopbar() {
  const { 
    status, saving, saveError, saveArticle, publishArticle, 
    submitForReview, lastSaved, toggleSidebar, isFocusMode, 
    toggleFocusMode, getMissingRequirements, setActiveTab
  } = useEditorStore();
  const { user } = useAuthStore();
  const { site } = useParams<{ site: string }>();
  const router = useRouter();
  const [showMissing, setShowMissing] = useState(false);

  const isEditor = user?.role === 'superadmin' || user?.role === 'wapimred';
  const missingRequirements = getMissingRequirements();
  const primaryAction = getPrimaryAction(status, isEditor, missingRequirements.length);
  const saveStatusLabel = getSaveStatusLabel({ saving, saveError, lastSaved });

  const handlePrimaryAction = async () => {
    if (primaryAction.disabled) {
      setShowMissing(!showMissing);
      return;
    }
    
    if (isEditor) {
      const confirmationLabel = status === 'scheduled' ? 'menerbitkan sekarang post terjadwal ini' : 'menerbitkan post ini';
      if (!confirm(`Apakah Anda yakin ingin ${confirmationLabel}?`)) return;
      await publishArticle();
    } else {
      if (!confirm('Kirim post ini untuk di-review oleh redaksi?')) return;
      await submitForReview();
      router.push(`/${site}/dashboard/articles`);
    }
  };

  return (
    <div className={cn(
      "fixed top-0 right-0 left-[var(--editor-shell-offset,0px)] z-50 border-b border-gray-100 bg-white/95 px-3 py-2 shadow-sm backdrop-blur-md transition-all duration-500 dark:border-white/5 dark:bg-slate-900/90 sm:px-4 md:flex md:h-14 md:items-center md:justify-between md:px-6 md:py-0 lg:px-7",
      isFocusMode && "left-0"
    )}>
      <div className="flex items-center justify-between gap-3 md:min-w-0 md:justify-start">
        <div className="flex min-w-0 items-center gap-2.5 md:gap-3">
        <button 
          onClick={() => router.back()}
          className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-50 hover:text-brand-black dark:hover:bg-white/5 dark:hover:text-white"
        >
          <History size={18} />
        </button>
        <div className="h-5 w-px bg-gray-100 dark:bg-white/5" />
        <div className="flex min-w-0 items-center gap-2 md:gap-2.5">
          <span className="truncate text-[9px] font-black uppercase tracking-[0.18em] text-brand-black dark:text-white sm:text-[10px]">Ruang Editor</span>
          <div className="inline-flex items-center gap-1.5">
            <div className={cn(
              "px-2 py-0.5 rounded-sm text-[9px] font-black uppercase tracking-widest border",
              STATUS_COLORS[status] || STATUS_COLORS.draft
            )}>
              {STATUS_LABELS[status] || status}
            </div>
            {STATUS_HELPERS[status] && (
              <EditorHelpHint text={STATUS_HELPERS[status]} />
            )}
          </div>
        </div>
        </div>

        <div className="relative md:hidden">
          <button
            onClick={handlePrimaryAction}
            disabled={saving}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3 py-2 text-[9px] font-black uppercase tracking-[0.16em] transition-all disabled:cursor-not-allowed disabled:opacity-50",
              primaryAction.tone === 'danger' && "bg-brand-red text-white shadow-lg shadow-brand-red/10",
              primaryAction.tone === 'success' && "bg-emerald-600 text-white shadow-lg shadow-emerald-600/10",
              primaryAction.tone === 'neutral' && "border border-gray-200 bg-gray-100 text-gray-400 dark:border-white/10 dark:bg-white/10 dark:text-gray-300"
            )}
            title={primaryAction.label}
          >
            {primaryAction.tone === 'success'
              ? <CheckCircle2 size={13} />
              : <Send size={13} />
            }
            <span className="max-w-[112px] truncate">{primaryAction.label}</span>
          </button>

          {showMissing && missingRequirements.length > 0 && (
            <div className="absolute top-full right-0 mt-3 w-[min(18rem,calc(100vw-1.5rem))] rounded-2xl border border-gray-100 bg-white p-4 shadow-2xl dark:border-white/10 dark:bg-slate-900 z-50">
              <div className="mb-3 flex items-center gap-2">
                <AlertCircle size={16} className="text-brand-red" />
                <span className="text-[10px] font-black uppercase tracking-widest text-brand-black dark:text-white">Syarat Belum Lengkap</span>
              </div>
              <div className="space-y-2.5">
                {missingRequirements.map((req, i) => (
                  <div key={i} className="flex items-start gap-2 text-[11px] leading-relaxed text-gray-500 dark:text-gray-400">
                    <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gray-200 dark:bg-white/10" />
                    {req}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between gap-2 border-t border-gray-100/80 pt-2 dark:border-white/5 md:mt-0 md:border-t-0 md:pt-0">
        <div className="flex min-w-0 items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 md:hidden">
          {saving ? (
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-brand-red animate-pulse" />
              {saveStatusLabel}
            </div>
          ) : saveError ? (
            <div className="flex items-center gap-1.5 text-red-500" title={saveError}>
              <div className="h-2 w-2 rounded-full bg-red-500" />
              {saveStatusLabel}
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={12} className="text-green-500" />
              {saveStatusLabel}
            </div>
          )}
        </div>

        <div className="hidden items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 lg:flex">
          {saving ? (
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-brand-red rounded-full animate-pulse" />
              {saveStatusLabel}
            </div>
          ) : saveError ? (
            <div className="flex items-center gap-1.5 text-red-500" title={saveError}>
              <div className="w-2 h-2 bg-red-500 rounded-full" />
              {saveStatusLabel}
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={12} className="text-green-500" />
              {saveStatusLabel}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5 md:ml-auto">
        {!isFocusMode && <div className="hidden h-5 w-px bg-gray-100 dark:bg-white/5 md:block" />}

          <button
            onClick={() => toggleFocusMode()}
            className={cn(
              "rounded-lg border border-transparent p-2 transition-all",
              isFocusMode 
                ? "bg-brand-red text-white shadow-lg shadow-brand-red/20" 
                : "bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:text-brand-red hover:border-brand-red/20"
            )}
            title={isFocusMode ? "Keluar Mode Fokus" : "Mode Fokus"}
          >
            {isFocusMode ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>

          {!isFocusMode && (
            <button
              onClick={() => saveArticle()}
              disabled={saving}
              className="hidden items-center gap-2 rounded-lg border border-gray-200 px-3.5 py-2 text-[10px] font-black uppercase tracking-widest text-brand-black transition-all hover:bg-gray-50 disabled:opacity-50 dark:border-white/10 dark:text-white dark:hover:bg-white/5 sm:flex"
            >
              <Save size={14} /> Simpan
            </button>
          )}

          {!isFocusMode && (
            <button
              onClick={() => {
                setActiveTab('assist')
                toggleSidebar(true)
              }}
              className="rounded-lg border border-transparent bg-gray-50 p-2 text-gray-500 transition-all hover:border-brand-red/20 hover:text-brand-red dark:bg-white/5 dark:text-gray-400 sm:p-2.5"
              title="Asisten AI"
            >
              <Sparkles size={18} />
            </button>
          )}

          {!isFocusMode && (
            <button
              onClick={() => {
                setActiveTab('settings')
                toggleSidebar(true)
              }}
              className="rounded-lg border border-transparent bg-gray-50 p-2 text-gray-500 transition-all hover:border-brand-red/20 hover:text-brand-red dark:bg-white/5 dark:text-gray-400 sm:p-2.5"
              title="Pengaturan Post"
            >
              <Settings size={18} />
            </button>
          )}
          
          <div className="relative hidden md:block">
            <button
              onClick={handlePrimaryAction}
              disabled={saving}
              className={cn(
                "flex items-center gap-2 rounded-lg px-5 py-2 text-[10px] font-black uppercase tracking-widest transition-all disabled:cursor-not-allowed disabled:opacity-50",
                primaryAction.tone === 'danger' && "bg-brand-red text-white hover:bg-red-700 shadow-lg shadow-brand-red/10",
                primaryAction.tone === 'success' && "bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-600/10",
                primaryAction.tone === 'neutral' && "bg-gray-100 dark:bg-white/10 text-gray-400 dark:text-gray-300 border border-gray-200 dark:border-white/10",
                isFocusMode && "px-4"
              )}
              title={primaryAction.label}
            >
              {primaryAction.tone === 'success'
                ? <CheckCircle2 size={14} />
                : <Send size={14} />
              }
              {primaryAction.label}
            </button>

            {showMissing && missingRequirements.length > 0 && (
              <div className="absolute top-full right-0 mt-3 w-64 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-white/10 shadow-2xl p-5 z-50">
                <div className="flex items-center gap-2 mb-4">
                  <AlertCircle size={16} className="text-brand-red" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-brand-black dark:text-white">Syarat Belum Lengkap</span>
                </div>
                <div className="space-y-3">
                  {missingRequirements.map((req, i) => (
                    <div key={i} className="flex items-start gap-2 text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-200 dark:bg-white/10 mt-1.5 shrink-0" />
                      {req}
                    </div>
                  ))}
                </div>
                <button 
                  onClick={() => setShowMissing(false)}
                  className="w-full mt-5 py-2 text-[9px] font-black uppercase tracking-widest text-gray-400 hover:text-brand-black dark:hover:text-white transition-colors"
                >
                  Tutup
                </button>
              </div>
            )}
          </div>

          <div className="hidden h-7 w-px bg-gray-100 dark:bg-white/5 md:block" />

          <button className="hidden p-2 text-gray-400 transition-colors hover:text-brand-black dark:hover:text-white md:block">
            <MoreHorizontal size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
