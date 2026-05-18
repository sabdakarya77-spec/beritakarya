'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  ArrowRight, 
  Upload, 
  CheckCircle2, 
  Image as ImageIcon, 
  Video, 
  AlertCircle, 
  QrCode, 
  Building2, 
  Sparkles,
  ChevronRight,
  BarChart3
} from 'lucide-react';
import Link from 'next/link';

export default function OrderAdPage() {
  const { site } = useParams() as { site: string };
  const router = useRouter();
  
  const [step, setStep] = useState(1);
  const [campaignName, setCampaignName] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [slot, setSlot] = useState('leaderboard');
  const [duration, setDuration] = useState('30');
  const [mediaType, setMediaType] = useState('image');
  const [adFile, setAdFile] = useState<File | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [adFileName, setAdFileName] = useState('');
  const [receiptFileName, setReceiptFileName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Pricing details based on slots
  const PRICING: Record<string, { name: string, price: number, size: string }> = {
    leaderboard: { name: 'Leaderboard Atas (Header Banner)', price: 1500000, size: '970x90 px' },
    in_feed: { name: 'Dalam Artikel (Article Rectangle)', price: 500000, size: '300x250 px' },
    sidebar: { name: 'Sidebar Widget (Banner Samping)', price: 800000, size: '300x600 px' }
  };

  const getPrice = () => {
    const base = PRICING[slot]?.price || 0;
    const factor = duration === '7' ? 0.3 : duration === '14' ? 0.6 : 1.0;
    return Math.floor(base * factor);
  };

  const totalPrice = getPrice();

  const handleAdFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAdFile(e.target.files[0]);
      setAdFileName(e.target.files[0].name);
    }
  };

  const handleReceiptFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setReceiptFile(e.target.files[0]);
      setReceiptFileName(e.target.files[0].name);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    // Simulate uploading files and saving the transaction
    setTimeout(() => {
      setSubmitting(false);
      setStep(4);
    }, 2000);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      {/* Back button */}
      <div>
        <Link 
          href={`/${site}/dashboard`}
          className="inline-flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-brand-red uppercase tracking-widest transition-colors"
        >
          <ArrowLeft size={14} /> Kembali ke Dasbor
        </Link>
      </div>

      {/* Steps Indicator */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { num: 1, label: 'Detail Iklan' },
          { num: 2, label: 'Slot & Durasi' },
          { num: 3, label: 'Materi & Bayar' },
          { num: 4, label: 'Selesai' }
        ].map((s) => (
          <div 
            key={s.num}
            className={`border-t-2 pt-3 transition-colors ${step >= s.num ? 'border-brand-red' : 'border-gray-200 dark:border-white/5'}`}
          >
            <p className={`text-[9px] font-black uppercase tracking-widest ${step >= s.num ? 'text-brand-red' : 'text-gray-400'}`}>
              Langkah {s.num}
            </p>
            <p className={`text-[10px] font-bold uppercase tracking-widest ${step === s.num ? 'text-brand-black dark:text-white' : 'text-gray-400'}`}>
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* Main Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Container */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800/80 p-8 rounded-sm shadow-2xl shadow-black/5">
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-serif font-black text-brand-black dark:text-white uppercase tracking-tight mb-2">Informasi Kampanye Iklan</h2>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Masukkan detail promosi produk atau bisnis Anda</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-black dark:text-gray-300">
                    Nama Kampanye Iklan
                  </label>
                  <input
                    type="text"
                    required
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                    placeholder="Contoh: Promo Kemerdekaan Brand XYZ"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-sm text-brand-black dark:text-white focus:outline-none focus:border-brand-red transition-colors rounded-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-black dark:text-gray-300">
                    Target Link URL (Tautan Klik)
                  </label>
                  <input
                    type="url"
                    required
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="Contoh: https://brand-anda.com/promo atau WhatsApp Link"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-sm text-brand-black dark:text-white focus:outline-none focus:border-brand-red transition-colors rounded-sm"
                  />
                  <p className="text-[9px] text-gray-400">
                    * Alamat tujuan website atau link WhatsApp yang akan dituju saat audiens mengklik banner iklan Anda.
                  </p>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  disabled={!campaignName || !linkUrl}
                  onClick={() => setStep(2)}
                  className="px-6 py-3 bg-brand-red hover:bg-brand-black text-white text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed rounded-sm flex items-center gap-2 group"
                >
                  Lanjut ke Slot & Durasi
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8">
              <div>
                <h2 className="text-base font-serif font-black text-brand-black dark:text-white uppercase tracking-tight mb-2">Pilih Penempatan & Durasi</h2>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Tentukan lokasi tayang banner dan berapa lama masa sewa slot iklan</p>
              </div>

              {/* Slots Radio Cards */}
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-black dark:text-gray-300 block">
                  Penempatan Slot Iklan
                </label>
                <div className="space-y-3">
                  {[
                    { id: 'leaderboard', name: 'Leaderboard Atas (Header Banner)', desc: 'Impresi tertinggi di first-fold bagian atas situs regional.', size: '970x90 px' },
                    { id: 'in_feed', name: 'Dalam Artikel (Article Rectangle)', desc: 'CTR tertinggi, disisipkan secara alami di antara paragraf berita.', size: '300x250 px' },
                    { id: 'sidebar', name: 'Sidebar Widget (Banner Samping)', desc: 'Sangat cocok untuk materi promosi vertikal memanjang.', size: '300x600 px' }
                  ].map((s) => (
                    <label 
                      key={s.id}
                      className={`flex items-start gap-4 p-4 border rounded-sm cursor-pointer transition-all ${slot === s.id ? 'border-brand-red bg-brand-red/5' : 'border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/40'}`}
                    >
                      <input
                        type="radio"
                        name="ad_slot"
                        value={s.id}
                        checked={slot === s.id}
                        onChange={(e) => setSlot(e.target.value)}
                        className="mt-1 accent-brand-red"
                      />
                      <div className="flex-1">
                        <div className="flex justify-between items-start gap-2">
                          <span className="text-xs font-black text-brand-black dark:text-white uppercase tracking-tight">{s.name}</span>
                          <span className="text-[9px] font-black bg-gray-100 dark:bg-white/5 text-gray-400 px-2 py-0.5 rounded-sm uppercase">{s.size}</span>
                        </div>
                        <p className="text-[10px] text-brand-text-muted mt-1 leading-normal">{s.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Duration Tabs */}
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-black dark:text-gray-300 block">
                  Durasi Masa Tayang
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: '7', label: '7 Hari', discount: 'Paket Promo' },
                    { id: '14', label: '14 Hari', discount: 'Hemat 10%' },
                    { id: '30', label: '30 Hari', discount: 'Paket Populer' }
                  ].map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setDuration(d.id)}
                      className={`p-4 border rounded-sm text-center flex flex-col items-center justify-center transition-all ${duration === d.id ? 'border-brand-red bg-brand-red/5' : 'border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/40'}`}
                    >
                      <span className="text-xs font-black text-brand-black dark:text-white uppercase tracking-tight">{d.label}</span>
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">{d.discount}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-6 py-3 border border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/40 text-brand-black dark:text-white text-[10px] font-black uppercase tracking-widest transition-all rounded-sm flex items-center gap-2"
                >
                  <ArrowLeft size={14} /> Kembali
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-6 py-3 bg-brand-red hover:bg-brand-black text-white text-[10px] font-black uppercase tracking-widest transition-all rounded-sm flex items-center gap-2 group"
                >
                  Lanjut ke Materi & Bayar
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <h2 className="text-base font-serif font-black text-brand-black dark:text-white uppercase tracking-tight mb-2">Unggah Banner & Bukti Transfer</h2>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Selesaikan transaksi secara manual dengan mentransfer dan mengunggah bukti bayar</p>
              </div>

              {/* Upload Creative Media */}
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-black dark:text-gray-300 block">
                  Unggah Berkas Banner Iklan ({PRICING[slot]?.size})
                </label>
                <div className="flex gap-4 mb-3">
                  <button
                    type="button"
                    onClick={() => setMediaType('image')}
                    className={`px-4 py-2 text-[9px] font-black uppercase tracking-wider rounded-full flex items-center gap-1.5 border transition-all ${mediaType === 'image' ? 'bg-brand-red text-white border-brand-red' : 'border-gray-200 dark:border-slate-800 text-gray-400'}`}
                  >
                    <ImageIcon size={12} /> Gambar / GIF
                  </button>
                  <button
                    type="button"
                    onClick={() => setMediaType('video')}
                    className={`px-4 py-2 text-[9px] font-black uppercase tracking-wider rounded-full flex items-center gap-1.5 border transition-all ${mediaType === 'video' ? 'bg-brand-red text-white border-brand-red' : 'border-gray-200 dark:border-slate-800 text-gray-400'}`}
                  >
                    <Video size={12} /> Video MP4
                  </button>
                </div>

                <div className="relative border-2 border-dashed border-gray-200 dark:border-slate-800 hover:border-brand-red/50 transition-colors p-8 text-center rounded-sm">
                  <input
                    type="file"
                    required
                    accept={mediaType === 'image' ? 'image/*,image/gif' : 'video/mp4'}
                    onChange={handleAdFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Upload size={24} className="text-gray-400 mx-auto mb-3" />
                  <p className="text-xs font-black text-brand-black dark:text-white uppercase tracking-tight mb-1">
                    {adFileName ? `Berkas Terpilih: ${adFileName}` : `Pilih Berkas Media ${mediaType === 'image' ? 'Gambar/GIF' : 'Video MP4'}`}
                  </p>
                  <p className="text-[9px] text-gray-400 leading-relaxed uppercase tracking-wider">
                    Seret & letakkan berkas di sini atau klik untuk merambah folder.<br />
                    Maksimal ukuran file: 10MB.
                  </p>
                </div>
              </div>

              {/* Payment Methods Info */}
              <div className="border-t border-gray-100 dark:border-slate-800 pt-8 space-y-6">
                <div>
                  <h3 className="text-xs font-black text-brand-black dark:text-white uppercase tracking-[0.2em] mb-4">Informasi Rekening Transfer Beritakarya</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Bank BCA */}
                    <div className="p-4 bg-gray-50 dark:bg-slate-800/40 border border-gray-100 dark:border-slate-800 rounded-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <Building2 size={16} className="text-brand-red" />
                        <span className="text-xs font-black text-brand-black dark:text-white uppercase tracking-tight">Bank BCA Nusantara</span>
                      </div>
                      <p className="text-[14px] font-black text-brand-black dark:text-white tracking-widest text-brand-red">829-0123-456</p>
                      <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1">a/n PT Berita Karya Nusantara</p>
                    </div>

                    {/* Bank Mandiri */}
                    <div className="p-4 bg-gray-50 dark:bg-slate-800/40 border border-gray-100 dark:border-slate-800 rounded-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <Building2 size={16} className="text-brand-red" />
                        <span className="text-xs font-black text-brand-black dark:text-white uppercase tracking-tight">Bank Mandiri</span>
                      </div>
                      <p className="text-[14px] font-black text-brand-black dark:text-white tracking-widest text-brand-red">137-00-1234567-8</p>
                      <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1">a/n PT Berita Karya Nusantara</p>
                    </div>
                  </div>

                  <div className="mt-4 p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-sm flex items-center gap-3">
                    <QrCode size={20} className="text-emerald-500 shrink-0" />
                    <div>
                      <p className="text-[10px] font-black text-emerald-800 dark:text-emerald-400 uppercase tracking-tight">Mendukung Pembayaran QRIS Nasional</p>
                      <p className="text-[9px] text-emerald-600 dark:text-emerald-500/80 leading-normal uppercase tracking-wider font-semibold">
                        Pindai QRIS BeritaKarya (Dapat diminta langsung via tim support WA) atau transfer manual ke rekening bank di atas untuk kelancaran instan.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Upload Payment Receipt */}
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-black dark:text-gray-300 block">
                    Unggah Foto Bukti Transfer / Pembayaran
                  </label>
                  <div className="relative border-2 border-dashed border-gray-200 dark:border-slate-800 hover:border-brand-red/50 transition-colors p-8 text-center rounded-sm">
                    <input
                      type="file"
                      required
                      accept="image/*"
                      onChange={handleReceiptFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <Upload size={24} className="text-gray-400 mx-auto mb-3" />
                    <p className="text-xs font-black text-brand-black dark:text-white uppercase tracking-tight mb-1">
                      {receiptFileName ? `Bukti Terpilih: ${receiptFileName}` : 'Pilih Berkas Bukti Transfer (.png / .jpg)'}
                    </p>
                    <p className="text-[9px] text-gray-400 leading-relaxed uppercase tracking-wider">
                      Pastikan nominal transfer, nama rekening tujuan, dan waktu transaksi tercetak jelas.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-between">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => setStep(2)}
                  className="px-6 py-3 border border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/40 text-brand-black dark:text-white text-[10px] font-black uppercase tracking-widest transition-all rounded-sm flex items-center gap-2"
                >
                  <ArrowLeft size={14} /> Kembali
                </button>
                <button
                  type="submit"
                  disabled={submitting || !adFile || !receiptFile}
                  className="px-8 py-3 bg-brand-red hover:bg-brand-black text-white text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed rounded-sm flex items-center gap-2 group shadow-lg shadow-brand-red/20"
                >
                  {submitting ? 'Mengirim Data...' : 'Kirim Bukti Bayar & Selesaikan'}
                  <CheckCircle2 size={14} />
                </button>
              </div>
            </form>
          )}

          {step === 4 && (
            <div className="text-center py-12 space-y-6">
              <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
                <CheckCircle2 size={36} />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-serif font-black text-brand-black dark:text-white uppercase tracking-tight">Pesanan Iklan Sukses Dibuat!</h2>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-widest">Status: Menunggu Verifikasi Bukti Bayar</p>
              </div>

              <div className="max-w-md mx-auto bg-gray-50 dark:bg-slate-800/40 border border-gray-100 dark:border-slate-800/80 p-6 rounded-sm text-left space-y-4">
                <div className="flex justify-between border-b border-gray-200 dark:border-slate-800 pb-2.5 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                  <span>Rincian Transaksi</span>
                  <span>Invoice #BK-{Math.floor(1000 + Math.random() * 9000)}</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between font-semibold"><span className="text-gray-400">Nama Kampanye:</span> <span className="text-brand-black dark:text-white">{campaignName}</span></div>
                  <div className="flex justify-between font-semibold"><span className="text-gray-400">Penempatan Slot:</span> <span className="text-brand-black dark:text-white">{PRICING[slot]?.name}</span></div>
                  <div className="flex justify-between font-semibold"><span className="text-gray-400">Durasi Sewa:</span> <span className="text-brand-black dark:text-white">{duration} Hari</span></div>
                  <div className="flex justify-between font-semibold"><span className="text-gray-400">Metode Bayar:</span> <span className="text-brand-black dark:text-white">Manual Transfer</span></div>
                  <div className="flex justify-between font-black text-brand-red pt-2 border-t border-gray-200 dark:border-slate-800 text-sm"><span>Total Pembayaran:</span> <span>Rp {totalPrice.toLocaleString('id-ID')}</span></div>
                </div>
              </div>

              <p className="text-[10px] text-gray-400 leading-relaxed max-w-md mx-auto uppercase tracking-wider">
                Bukti transfer dan media kreatif iklan Anda telah terunggah secara aman. Tim marketing kami akan melakukan pencocokan mutasi dan memverifikasi kelayakan materi iklan dalam waktu 5-15 menit ke depan.
              </p>

              <div className="pt-4">
                <button
                  onClick={() => router.push(`/${site}/dashboard`)}
                  className="px-8 py-4 bg-brand-black dark:bg-white text-white dark:text-brand-black text-[11px] font-black uppercase tracking-[0.2em] hover:bg-brand-red dark:hover:bg-brand-red dark:hover:text-white transition-all rounded-sm shadow-md"
                >
                  Kembali ke Dashboard Anda
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Cart Info */}
        <div className="space-y-6">
          <div className="bg-brand-black dark:bg-[#080d18] border border-white/5 p-6 rounded-sm text-white shadow-2xl">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-brand-red mb-4">Ringkasan Pesanan</h3>
            <div className="space-y-4">
              <div className="border-b border-white/10 pb-3">
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Subdomain Regional</p>
                <p className="text-xs font-black uppercase tracking-tight mt-0.5">{site === 'pusat' ? 'BeritaKarya Pusat' : `BeritaKarya Regional ${site}`}</p>
              </div>

              <div className="border-b border-white/10 pb-3">
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Slot Penempatan</p>
                <p className="text-xs font-black uppercase tracking-tight mt-0.5">{PRICING[slot]?.name}</p>
                <p className="text-[9px] font-bold text-gray-400 uppercase mt-0.5">Dimensi: {PRICING[slot]?.size}</p>
              </div>

              <div className="border-b border-white/10 pb-3">
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Durasi Sewa</p>
                <p className="text-xs font-black uppercase tracking-tight mt-0.5">{duration} Hari</p>
              </div>

              <div className="pt-2 flex justify-between items-baseline">
                <span className="text-[10px] font-black uppercase tracking-wider">Total Biaya:</span>
                <span className="text-base font-serif font-black text-brand-red">Rp {totalPrice.toLocaleString('id-ID')}</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-6 rounded-sm">
            <div className="flex gap-3 items-start">
              <Sparkles size={16} className="text-brand-red shrink-0 mt-0.5 animate-pulse" />
              <div>
                <h4 className="text-[10px] font-black text-brand-black dark:text-white uppercase tracking-wider mb-1">Mendukung Migrasi Otomatis</h4>
                <p className="text-[9px] text-gray-400 leading-relaxed uppercase tracking-wider">
                  Sistem pemesanan ini telah dirancang dengan struktur data hybrid. Di masa mendatang, proses verifikasi manual ini akan berubah menjadi scan QRIS dinamis langsung secara instan.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
