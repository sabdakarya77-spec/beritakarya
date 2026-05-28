'use client'
import { useState } from 'react'
import { useGrammar, useReadability, useFactCheck, useObjectivity } from '../../../hooks/useAI'
import { useEditorStore } from '../../../store/editorStore'
import { useKeyboardShortcuts } from '../../../hooks/useKeyboardShortcuts'
import { CheckCircle2, HelpCircle, XCircle, AlertCircle } from 'lucide-react'

interface Props {
  model?: string
  onTrigger?: () => void
}

function getAllText(blocks: any[]): string {
  return blocks
    .filter(b => ['paragraph','heading','quote'].includes(b.type))
    .map(b => b.content)
    .filter(Boolean)
    .join('\n\n')
}

const SCORE_COLOR = (s: number) =>
  s >= 70 ? 'text-green-600' : s >= 40 ? 'text-yellow-600' : 'text-red-500'

export function ValidateTab({ model = 'gpt-4o', onTrigger }: Props) {
  const { blocks, updateBlock } = useEditorStore()
  const [grammarState, doGrammar] = useGrammar(model)
  const [readState, doRead] = useReadability(model)
  const [factState, doFactCheck] = useFactCheck(model)
  const [objState, doObjectivity] = useObjectivity(model)
  const allText = getAllText(blocks)
  const [selectedCorrections, setSelectedCorrections] = useState<Set<number>>(new Set())

  const toggleCorrectionSelection = (index: number) => {
    const newSet = new Set(selectedCorrections)
    if (newSet.has(index)) {
      newSet.delete(index)
    } else {
      newSet.add(index)
    }
    setSelectedCorrections(newSet)
  }

  const toggleAllCorrections = () => {
    if (!grammarState.result) return
    if (selectedCorrections.size === grammarState.result.corrections.length) {
      setSelectedCorrections(new Set())
    } else {
      setSelectedCorrections(new Set(grammarState.result.corrections.map((_, i) => i)))
    }
  }

  const applySelectedCorrections = async () => {
    if (!grammarState.result) return
    
    const corrections = grammarState.result.corrections
    const selectedIndices = Array.from(selectedCorrections).sort((a, b) => b - a) // Apply from end to start to preserve indices
    
    for (const index of selectedIndices) {
      const correction = corrections[index]
      const { original, suggestion } = correction
      
      // Find and update all blocks that contain this text
      for (let i = 0; i < blocks.length; i++) {
        const block = blocks[i]
        const content = (block as any).content
        if (typeof content === 'string' && content.includes(original)) {
          const newContent = content.replace(original, suggestion)
          updateBlock(block.id, { content: newContent })
        }
      }
    }
    
    // Clear selection and re-run grammar check
    setSelectedCorrections(new Set())
    setTimeout(() => doGrammar({ text: getAllText(blocks) }), 100)
  }

  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: 'g',
      shift: true,
      ctrl: true,
      alt: false,
      action: () => {
        if (allText && !grammarState.loading) {
          if (onTrigger) onTrigger()
          doGrammar({ text: allText })
        }
      }
    },
    {
      key: 'v',
      shift: true,
      ctrl: true,
      alt: false,
      action: () => {
        if (allText && !readState.loading) {
          if (onTrigger) onTrigger()
          doRead({ text: allText })
        }
      }
    }
  ], true)

  return (
    <div className="space-y-5">
      {/* Grammar */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-gray-700">Cek Grammar</span>
          <button
            onClick={() => doGrammar({ text: allText })}
            disabled={grammarState.loading || !allText}
            className="text-xs px-3 py-1.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50"
          >
            {grammarState.loading ? 'Memeriksa...' : 'Cek Sekarang'}
          </button>
        </div>

        {grammarState.result && (
          <div>
            {grammarState.result.totalIssues === 0 ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-xs text-green-700">
                ✓ Tidak ditemukan masalah grammar
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between bg-gray-100 p-2 rounded-lg">
                  <p className="text-xs text-gray-600">{grammarState.result.totalIssues} masalah ditemukan</p>
                  <div className="flex gap-2">
                    <button
                      onClick={toggleAllCorrections}
                      className="text-xs text-amber-600 hover:text-amber-700 font-medium"
                    >
                      {selectedCorrections.size === grammarState.result.corrections.length ? 'Batal Pilih Semua' : 'Pilih Semua'}
                    </button>
                    {selectedCorrections.size > 0 && (
                      <button
                        onClick={applySelectedCorrections}
                        className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                      >
                        Terapkan ({selectedCorrections.size})
                      </button>
                    )}
                  </div>
                </div>
                
                {grammarState.result.corrections.map((c, i) => (
                  <div key={i} className={`bg-gray-50 border rounded-lg p-2.5 text-xs transition-all ${selectedCorrections.has(i) ? 'border-amber-300 bg-amber-50' : ''}`}>
                    <div className="flex items-start gap-2">
                      <input
                        type="checkbox"
                        checked={selectedCorrections.has(i)}
                        onChange={() => toggleCorrectionSelection(i)}
                        className="mt-0.5 h-3 w-3 text-amber-600 focus:ring-amber-500 border-gray-300 rounded shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2">
                          <span className="text-red-400 line-through shrink-0">{c.original}</span>
                          <span className="text-gray-400">→</span>
                          <span className="text-green-600 font-medium">{c.suggestion}</span>
                        </div>
                        <p className="text-gray-400 mt-1">{c.reason}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {grammarState.error && (
          <p className="text-xs text-red-500 bg-red-50 p-2 rounded-lg">{grammarState.error}</p>
        )}
      </div>

      {/* Readability */}
      <div className="border-t border-gray-150 dark:border-white/5 pt-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Keterbacaan</span>
          <button
            onClick={() => doRead({ text: allText })}
            disabled={readState.loading || !allText}
            className="text-xs px-3 py-1.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50"
          >
            {readState.loading ? 'Menganalisis...' : 'Analisis'}
          </button>
        </div>

        {readState.result && (
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className={`text-3xl font-bold ${SCORE_COLOR(readState.result.score)}`}>
                  {readState.result.score}
                </p>
                <p className="text-xs text-gray-400">Skor</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{readState.result.level}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{readState.result.summary}</p>
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Saran perbaikan:</p>
              {readState.result.suggestions.map((s, i) => (
                <div key={i} className="flex gap-2 text-xs text-gray-600 dark:text-gray-400 mb-1.5">
                  <span className="text-amber-500 shrink-0">•</span>
                  <span>{s}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {readState.error && (
          <p className="text-xs text-red-500 bg-red-50 dark:bg-red-950/20 p-2 rounded-lg">{readState.error}</p>
        )}
      </div>

      {/* Objectivity & Ethics Audit */}
      <div className="border-t border-gray-150 dark:border-white/5 pt-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex flex-col">
            <span className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300">⚖️ Audit Objektivitas & Kode Etik</span>
            <span className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-0.5">Bias, Opini, dan Kepatuhan KEJ</span>
          </div>
          <button
            onClick={() => doObjectivity({ text: allText })}
            disabled={objState.loading || !allText}
            className="text-xs px-3 py-1.5 bg-brand-red hover:bg-red-600 text-white rounded-lg disabled:opacity-50 font-black uppercase tracking-wider transition-all"
          >
            {objState.loading ? 'Menganalisis...' : 'Audit'}
          </button>
        </div>

        {objState.loading && (
          <div className="bg-slate-50 dark:bg-[#070b13] border border-gray-100 dark:border-white/5 rounded-xl p-4 text-center space-y-2">
            <div className="w-5 h-5 border-2 border-brand-red border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider animate-pulse">Memindai bias, opini, dan kepatuhan Kode Etik Jurnalistik...</p>
          </div>
        )}

        {objState.result && (
          <div className="space-y-4">
            {/* Score + Status */}
            <div className="bg-slate-50 dark:bg-[#070b13] border border-gray-100 dark:border-white/5 rounded-xl p-4 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg ${
                  objState.result.score >= 80 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                    : objState.result.score >= 50
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                }`}>
                  {objState.result.score}%
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300">Skor Objektivitas</h4>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase mt-0.5 tracking-wider">Netralitas & Kode Etik</p>
                </div>
              </div>
              <div className="text-right">
                <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md border ${
                  objState.result.score >= 80
                    ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900/20'
                    : objState.result.score >= 50
                    ? 'bg-amber-950/40 text-amber-400 border-amber-900/20'
                    : 'bg-red-950/40 text-red-400 border-red-900/20'
                }`}>
                  {objState.result.score >= 80 ? 'Objektif' : objState.result.score >= 50 ? 'Netral' : 'Butuh Revisi'}
                </span>
              </div>
            </div>

            {/* Ethical Compliance */}
            <div className="bg-[#0f172a]/20 border border-brand-red/10 rounded-xl p-3 text-xs leading-relaxed text-gray-600 dark:text-gray-300">
              <span className="font-extrabold text-brand-red text-[9px] uppercase tracking-widest block mb-1">Kepatuhan Kode Etik Jurnalistik:</span>
              {objState.result.ethicalCompliance}
            </div>

            {/* Issues list */}
            {objState.result.issues.length > 0 && (
              <div className="space-y-3">
                <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Masalah Terdeteksi ({objState.result.issues.length}):</p>
                {objState.result.issues.map((issue, idx) => (
                  <div key={idx} className="bg-white dark:bg-[#0c121e]/40 border border-gray-100 dark:border-white/5 rounded-xl p-3.5 space-y-2.5 shadow-sm">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-extrabold text-gray-800 dark:text-gray-200 leading-snug">
                        &ldquo;{issue.original}&rdquo;
                      </p>
                      <span className={`shrink-0 inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border ${
                        issue.severity === 'high'
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          : issue.severity === 'medium'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                      }`}>
                        {issue.severity === 'high' ? 'KRITIS' : issue.severity === 'medium' ? 'SEDANG' : 'RINGAN'}
                      </span>
                    </div>

                    <div className="bg-emerald-50 dark:bg-emerald-950/10 border border-emerald-200 dark:border-emerald-900/20 rounded-lg p-2.5 text-[11px] leading-relaxed">
                      <span className="font-extrabold text-[9px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block mb-1">Saran Perbaikan:</span>
                      <span className="text-emerald-700 dark:text-emerald-300">{issue.suggested}</span>
                    </div>

                    <div className="text-[11px] text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-[#070b13]/60 p-2.5 rounded-lg leading-relaxed border border-gray-100 dark:border-white/5">
                      <span className="font-extrabold text-[9px] uppercase tracking-wider text-gray-400 dark:text-gray-500 block mb-1">Alasan:</span>
                      {issue.reason}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Suggestions */}
            {objState.result.suggestions.length > 0 && (
              <div className="bg-amber-50 dark:bg-amber-950/10 border border-amber-200 dark:border-amber-900/20 rounded-xl p-3">
                <span className="font-extrabold text-amber-600 dark:text-amber-400 text-[9px] uppercase tracking-widest block mb-1.5">💡 Saran Umum:</span>
                <ul className="space-y-1">
                  {objState.result.suggestions.map((s, i) => (
                    <li key={i} className="text-[11px] text-amber-800 dark:text-amber-300 flex gap-2">
                      <span className="shrink-0">•</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {objState.error && (
          <p className="text-xs text-red-500 bg-red-50 dark:bg-red-950/20 p-2.5 rounded-xl border border-red-200 dark:border-red-900/20 mt-3">{objState.error}</p>
        )}
      </div>

      {/* Fact Checking / Cek Fakta (THE PREMIUM WOW FEATURE!) */}
      <div className="border-t border-gray-150 dark:border-white/5 pt-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex flex-col">
            <span className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300">🔍 Cek Fakta & Kredibilitas</span>
            <span className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-0.5">Analisis Klaim Real-time</span>
          </div>
          <button
            onClick={() => doFactCheck({ text: allText })}
            disabled={factState.loading || !allText}
            className="text-xs px-3 py-1.5 bg-brand-red hover:bg-red-600 text-white rounded-lg disabled:opacity-50 font-black uppercase tracking-wider transition-all"
          >
            {factState.loading ? 'Verifikasi...' : 'Verifikasi'}
          </button>
        </div>

        {factState.loading && (
          <div className="bg-slate-50 dark:bg-[#070b13] border border-gray-100 dark:border-white/5 rounded-xl p-4 text-center space-y-2">
            <div className="w-5 h-5 border-2 border-brand-red border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider animate-pulse">Memindai klaim faktual & kredibilitas berita...</p>
          </div>
        )}

        {factState.result && (
          <div className="space-y-4">
            {/* Trust Score Gauge */}
            <div className="bg-slate-50 dark:bg-[#070b13] border border-gray-100 dark:border-white/5 rounded-xl p-4 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg ${
                  factState.result.trustScore >= 80 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                    : factState.result.trustScore >= 50
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                }`}>
                  {factState.result.trustScore}%
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300">Skor Kepercayaan</h4>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase mt-0.5 tracking-wider">Verifikasi Integritas Data</p>
                </div>
              </div>
              
              <div className="text-right">
                <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md border ${
                  factState.result.trustScore >= 80
                    ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900/20'
                    : factState.result.trustScore >= 50
                    ? 'bg-amber-950/40 text-amber-400 border-amber-900/20'
                    : 'bg-red-955/40 text-red-400 border-red-900/20'
                }`}>
                  {factState.result.trustScore >= 80 ? 'Kredibel' : factState.result.trustScore >= 50 ? 'Ragu-Ragu' : 'Butuh Revisi'}
                </span>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-[#0f172a]/20 border border-brand-red/10 rounded-xl p-3 text-xs leading-relaxed text-gray-600 dark:text-gray-300">
              <span className="font-extrabold text-brand-red text-[9px] uppercase tracking-widest block mb-1">Ringkasan Analis:</span>
              {factState.result.summary}
            </div>

            {/* Claims list */}
            <div className="space-y-3">
              <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Klaim Terdeteksi ({factState.result.claims.length}):</p>
              {factState.result.claims.map((claim, idx) => (
                <div key={idx} className="bg-white dark:bg-[#0c121e]/40 border border-gray-100 dark:border-white/5 rounded-xl p-3.5 space-y-3.5 shadow-sm">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-extrabold text-gray-800 dark:text-gray-200 leading-snug">
                      &ldquo;{claim.claim}&rdquo;
                    </p>
                    <span className={`inline-flex items-center gap-1 shrink-0 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border ${
                      claim.verdict === 'Benar'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : claim.verdict === 'Sebagian Benar'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        : claim.verdict === 'Salah'
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                    }`}>
                      {claim.verdict === 'Benar' && <CheckCircle2 size={9} />}
                      {claim.verdict === 'Sebagian Benar' && <AlertCircle size={9} />}
                      {claim.verdict === 'Salah' && <XCircle size={9} />}
                      {claim.verdict === 'Belum Terverifikasi' && <HelpCircle size={9} />}
                      {claim.verdict}
                    </span>
                  </div>

                  <div className="text-[11px] text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-[#070b13]/60 p-2.5 rounded-lg leading-relaxed border border-gray-100 dark:border-white/5">
                    <span className="font-extrabold text-[9px] uppercase tracking-wider text-gray-400 dark:text-gray-500 block mb-1">Alasan Putusan:</span>
                    {claim.explanation}
                  </div>

                  {claim.sources && claim.sources.length > 0 && (
                    <div className="pt-1.5 border-t border-gray-50 dark:border-white/5">
                      <span className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest block mb-1.5">Sumber Pembuktian:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {claim.sources.map((src, sIdx) => (
                          <span key={sIdx} className="bg-gray-100 dark:bg-slate-900/60 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-white/5 rounded-md px-2 py-0.5 text-[9px] font-semibold">
                            {src}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {factState.error && (
          <p className="text-xs text-red-500 bg-red-50 dark:bg-red-950/20 p-2.5 rounded-xl border border-red-200 dark:border-red-900/20 mt-3">{factState.error}</p>
        )}
      </div>
    </div>
  )
}