# 🔬 Laporan Audit Fungsi Dashboard Panel — BeritaKarya

**Audit Dilakukan Oleh:** Senior Audit Development System  
**Tanggal:** 15 Mei 2026  
**Scope:** Audit mendalam per-fungsi pada setiap menu dashboard panel

---

## 🗂️ RINGKASAN EKSEKUTIF AUDIT FUNGSI

| Tingkat | Jumlah | Contoh |
|---|---|---|
| 🚨 Kritis | 7 | API tanpa auth, password plaintext, redirect salah |
| ⚠️ Penting | 11 | URL hardcoded, fake data, missing endpoint, confirm() |
| 🔧 Minor | 10 | Tombol non-fungsional, UI tidak konsisten, label salah |
| ✅ Berfungsi Baik | 38 fungsi | Lihat tabel peta status |

---

## 📝 MENU 1: EDITOR ARTIKEL (`/articles/[id]`)

**File Utama:** `components/editor/Editor.tsx`, `EditorialSidebar.tsx`

### ✅ Fungsi Berfungsi:
| Fungsi | Status | Detail |
|---|---|---|
| Auto-save konten | ✅ | Interval reguler via editorStore |
| Upload gambar utama | ✅ | URL paste + preview |
| Pilih kategori | ✅ | Load dinamis dari `/categories` |
| Toggle Breaking/Eksklusif/Featured | ✅ | Tersimpan ke store dan API |
| Manajemen Tag | ✅ | Add/remove realtime |
| SEO Meta Title + Description | ✅ | Dengan character counter |
| Google Preview | ✅ | Live preview judul & deskripsi |
| Version History | ✅ | List + restore via API |
| AI Sidebar | ✅ | Generate/rewrite via AI service |

### ⚠️ Temuan:
**ED-1 [PENTING]:** Di `EditorialSidebar.tsx`, restore versi menggunakan `alert()` native:
```tsx
alert('Berhasil mengembalikan ke versi terpilih');
alert('Gagal mengembalikan versi');
```
Tidak konsisten dengan sistem desain premium.

**ED-2 [PENTING]:** **Konfirmasi restore menggunakan `confirm()` native** yang menyebabkan potensi accidental click pada mobile karena dialog konfirmasi sistem tidak responsif.

**ED-3 [MINOR]:** Fitur upload gambar utama **hanya mendukung URL paste** — tidak ada tombol upload file langsung dari komputer. User harus hosting gambar sendiri dulu.

**ED-4 [MINOR]:** Tombol "Terapkan Perubahan" di footer Editorial Sidebar hanya menutup sidebar — tidak ada aksi nyata (tidak menyimpan ke API).

**ED-5 [MINOR]:** Versi baru di Version History berdasarkan komentar di kode hanya dibuat saat "mengirim review atau mempublikasikan" — tidak ada auto-versioning saat auto-save. Riwayat bisa sangat terbatas.

---

## 📋 MENU 2: ANTRIAN REVIEW (`/review`)

**File:** `app/[site]/dashboard/review/page.tsx`

### ✅ Fungsi Berfungsi:
| Fungsi | Status |
|---|---|
| Tampilkan artikel per tab status | ✅ |
| Workflow status diagram | ✅ |
| Tombol "Setujui" dengan modal + catatan | ✅ |
| Tombol "Minta Revisi" | ✅ |
| Tombol "Terbitkan" (dari status approved) | ✅ |
| Role guard (hanya superadmin/wapimred) | ✅ |
| Loading state + empty state | ✅ |
| Modal setujui dengan catatan opsional | ✅ |

### ⚠️ Temuan:
**RV-1 [PENTING]:** **Antrian review memuat SEMUA artikel** (`limit: 100`) lalu memfilter di frontend — bukan memfilter di server:
```tsx
const { data } = await api.get('/articles', { params: { limit: 100 } });
// Filter di frontend:
const tabArticles = articles.filter(a => a.status === activeTab);
```
Untuk redaksi besar dengan ribuan artikel, ini sangat tidak efisien. Status filter seharusnya dikirim ke backend.

**RV-2 [PENTING]:** **Tombol "Reject" tidak ada di UI review** — status `archived` digunakan untuk reject, namun tidak ada tombol eksplisit "Tolak/Arsipkan" di tampilan. Hanya ada Revisi dan Setujui. Artikel yang tidak layak tidak bisa ditolak langsung dari antrian.

**RV-3 [MINOR]:** Error handling masih menggunakan `alert()`.

**RV-4 [MINOR]:** Tidak ada fitur **sort by date/priority** — antrian muncul dalam urutan default.

---

## 🔒 MENU 3: ANTRIAN KYC Admin (`/review/kyc`)

**File:** `app/[site]/dashboard/review/kyc/page.tsx`

### ✅ Fungsi Berfungsi:
| Fungsi | Status |
|---|---|
| List pengajuan KYC dengan pagination | ✅ |
| Filter status (pending/verified/rejected/all) | ✅ |
| Stats card (menunggu, disetujui, ditolak, waktu rata-rata) | ✅ |
| Grafik tren pengajuan 7 hari (Recharts) | ✅ |
| Search nama/email (submit-based) | ✅ |
| Tombol "Tinjau" → navigasi ke detail | ✅ |

### 🚨 Temuan Kritis:
**KYC-1 [KRITIS]:** **Semua API call menggunakan `axios` + manual localStorage token** — bukan `api` instance dengan interceptor:
```tsx
const token = localStorage.getItem('accessToken')
await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/v1/kyc/stats?site=${siteId}`, {
  headers: { Authorization: `Bearer ${token}` }
})
```
**Dampak:** Token refresh otomatis tidak berjalan. Sesi expired tidak ter-redirect ke login. Hardcoded fallback `http://localhost:4000` berbahaya di production.

**KYC-2 [KRITIS]:** **URL API hardcoded `localhost:4000`** — jika `NEXT_PUBLIC_API_URL` tidak di-set, semua request di production akan mencoba ke localhost yang tidak ada.

**KYC-3 [PENTING]:** **Recharts di-require secara dynamic** dengan cara yang tidak aman:
```tsx
const { BarChart, Bar, XAxis, ... } = require('recharts')
```
Penggunaan `require()` di dalam component function body (bukan di top-level) bisa menyebabkan error di SSR dan tidak optimal untuk tree-shaking.

**KYC-4 [PENTING]:** Status "rejected" ditentukan oleh `user.kycNotes?.includes('REJECTED')` — ini adalah anti-pattern yang sudah dicatat di audit backend. Bergantung pada substring match yang rapuh.

**KYC-5 [MINOR]:** Route detail (`/${siteId}/dashboard/review/kyc/${user.id}`) — perlu verifikasi apakah halaman detail user KYC ini benar-benar ada.

---

## 👥 MENU 4: MONITOR TIM (`/team`)

**File:** `app/[site]/dashboard/team/page.tsx`

### ✅ Fungsi Berfungsi:
| Fungsi | Status |
|---|---|
| Daftar wartawan dengan stats | ✅ |
| Search filter nama/email | ✅ |
| Animasi card (framer-motion) | ✅ |
| Badge produktivitas (Award jika > 10 post) | ✅ |

### ⚠️ Temuan:
**TM-1 [KRITIS]:** **`isOnline` status adalah data dummy** — field ini ada di TypeScript interface tapi **endpoint `/users/stats` tidak mengembalikan status online**. Tidak ada WebSocket atau heartbeat mechanism yang bisa menghasilkan data ini. Indikator "online" (titik hijau) selalu false atau undefined.
```tsx
{member.isOnline && (
  <span className="... w-4 h-4 bg-emerald-500 ...rounded-full" /> // Selalu tidak muncul
)}
```

**TM-2 [PENTING]:** Endpoint `/users/stats` belum dikonfirmasi ada di backend. Perlu verifikasi endpoint ini exist dan mengembalikan format yang tepat (`publishedCount`, `totalViews`, `avgWords`).

**TM-3 [MINOR]:** Tombol "Profil Lengkap" dan tombol `MoreVertical` (⋮) **tidak melakukan apapun** — tidak ada onClick handler atau link.

---

## 👤 MENU 5: PENGGUNA (`/users`)

**File:** `app/[site]/dashboard/users/page.tsx`

### ✅ Fungsi Berfungsi:
| Fungsi | Status |
|---|---|
| List pengguna dengan filter site | ✅ |
| Toggle "Semua Situs" (superadmin) | ✅ |
| Stats summary (total, per role) | ✅ |
| Badge role berwarna | ✅ |

### 🚨 Temuan Kritis:
**US-1 [KRITIS]:** **`fetch()` tanpa Authorization header** — sama dengan masalah di admin/page.tsx:
```tsx
const response = await fetch(`/api/v1/users?${params.toString()}`);
// ↑ Tidak ada token! Akan dapat 401 Unauthorized
```

**US-2 [KRITIS]:** **URL site diambil dari `window.location.pathname` secara manual** — sangat rapuh dan error-prone:
```tsx
const path = window.location.pathname;
const match = path.match(/^[^/]+/); // Regex ini salah! Tidak menangkap site yang benar
if (match) {
  setSiteId(match[0].slice(1)); // Ini akan selalu return '' karena match[0][0] adalah '/'
}
```
**Harusnya menggunakan `useParams()` dari Next.js seperti halaman lain.**

**US-3 [PENTING]:** **Tidak ada aksi apapun dalam tabel** — tidak ada tombol edit role, suspend, hapus, atau undang. Tabel hanya untuk melihat (read-only).

**US-4 [PENTING]:** **Tidak ada search/filter** dalam tabel pengguna. Untuk sistem dengan banyak user, ini sangat tidak praktis.

**US-5 [MINOR]:** "Disetujui Hari Ini" dan "Total Diskusi" di stats summary **hardcoded `0`** — tidak diambil dari API.

---

## 🏷️ MENU 6: KATEGORI (`/categories`)

**File:** `app/[site]/dashboard/categories/page.tsx`

### ✅ Fungsi Berfungsi:
| Fungsi | Status |
|---|---|
| List kategori per situs | ✅ |
| Tambah kategori baru | ✅ |
| Auto-generate slug dari nama | ✅ (dengan regex yang baik) |
| Hapus kategori lokal | ✅ |
| Toggle Global View (superadmin) | ✅ |
| Proteksi hapus kategori global | ✅ |

### ⚠️ Temuan:
**KT-1 [KRITIS]:** **`fetch()` tanpa Authorization header** di semua operasi CRUD:
```tsx
const response = await fetch('/api/v1/categories', { method: 'POST', ... })
// ↑ Tidak ada token! Akan dapat 401
```

**KT-2 [PENTING]:** **URL site diambil via `window.location.pathname` dengan regex yang salah** — sama persis dengan masalah di `users/page.tsx`.

**KT-3 [PENTING]:** **Tidak ada fitur Edit Kategori** — hanya Create dan Delete. Untuk mengubah nama kategori, user harus hapus dan buat ulang (yang bisa merusak URL artikel yang sudah ada!).

**KT-4 [MINOR]:** Konfirmasi hapus menggunakan `alert()` dan `confirm()` native.

---

## 💬 MENU 7: KOMENTAR / MODERASI (`/comments`)

**File:** `app/[site]/dashboard/comments/page.tsx`

### ✅ Fungsi Berfungsi:
| Fungsi | Status |
|---|---|
| List komentar pending moderasi | ✅ |
| Setujui komentar | ✅ |
| Tolak/Spam komentar | ✅ |
| Loading skeleton | ✅ |
| Panduan moderasi | ✅ |

### ⚠️ Temuan:
**CM-1 [PENTING]:** **Filter dan Search di header tidak berfungsi** — tombol Filter dan input Search tidak memiliki handler. Hanya dekorasi UI:
```tsx
<div className="flex items-center gap-2 px-4 py-2 ...">
  <Filter size={14} /> Filter  {/* ← Tidak ada onClick */}
</div>
<input type="text" placeholder="Cari komentar..." ... />  {/* ← Tidak ada onChange */}
```

**CM-2 [PENTING]:** Stats "Disetujui Hari Ini" dan "Total Diskusi" **hardcoded ke `0`** — tidak diambil dari API apapun.

**CM-3 [PENTING]:** Tombol panah (ChevronRight) di setiap komentar **tidak ada onClick** — kemungkinan dimaksudkan untuk melihat detail komentar/artikel, tapi tidak berfungsi.

**CM-4 [MINOR]:** Reject menggunakan `confirm()` native.

**CM-5 [MINOR]:** Tidak ada filter berdasarkan artikel atau tanggal — semua komentar pending ditampilkan sekaligus tanpa sortir.

---

## 🛡️ MENU 8: AUDIT LOG (`/audit`)

**File:** `app/[site]/dashboard/audit/page.tsx`

### ✅ Fungsi Berfungsi (Paling Lengkap!):
| Fungsi | Status |
|---|---|
| List log dengan pagination | ✅ |
| Filter berdasarkan aksi (text search) | ✅ |
| Filter berdasarkan tipe entitas | ✅ |
| Stats total + 7 hari + top actions | ✅ |
| Bar chart aksi terbanyak | ✅ |
| Modal detail log (oldValue/newValue) | ✅ |
| Responsive (desktop table + mobile cards) | ✅ |
| Role guard (redirect jika bukan admin) | ✅ |
| Refresh manual | ✅ |
| Format waktu relatif (date-fns) | ✅ |

### ⚠️ Temuan (Minor):
**AL-1 [MINOR]:** Detail modal menampilkan `oldValue`/`newValue` tapi hanya memparsing `.title` dan `.status` — data lengkap seperti perubahan konten tidak terlihat.

**AL-2 [MINOR]:** Tidak ada fitur export log (CSV/JSON) untuk keperluan compliance audit eksternal.

---

## ⚙️ MENU 9: PENGATURAN SITUS (`/settings`)

**File:** `app/[site]/dashboard/settings/page.tsx`

### ✅ Fungsi Berfungsi:
| Fungsi | Status |
|---|---|
| Load data pengaturan dari API | ⚠️ Endpoint tidak ada |
| Form editing semua field | ✅ UI ada |
| Color picker brand color | ✅ UI ada |
| Trending topics add/remove | ✅ UI ada |

### 🚨 Temuan Kritis:
**ST-1 [KRITIS]:** **Endpoint `/sites/settings` tidak ada di backend** (dikonfirmasi dari audit backend). Semua data pengaturan tidak bisa diload maupun disimpan. Halaman ini sepenuhnya non-fungsional dari sisi data.

Endpoint yang seharusnya ada:
- `GET /api/v1/sites/settings` → Load settings site saat ini
- `PATCH /api/v1/sites/settings` → Update settings

---

## 🏛️ MENU 10: MANAJEMEN SITUS - Admin (`/admin`)

**File:** `app/[site]/dashboard/admin/page.tsx`

### ✅ Fungsi Berfungsi (UI):
| Fungsi | Status |
|---|---|
| Tabel list situs | UI ada |
| Form Create Site | UI ada |
| Form Edit Site | UI ada |
| Dialog modal | ✅ |

### 🚨 Temuan Kritis:
**AD-1 [KRITIS]:** **Semua `fetch()` tanpa Authorization header** — seluruh CRUD (list, create, edit, delete) akan mendapat 401:
```tsx
const res = await fetch('/api/v1/sites?includeStats=true')  // ← Tidak ada token
const res = await fetch(url, { method, body })              // ← Tidak ada token
const res = await fetch(`/api/v1/sites/${siteId}`, { method: 'DELETE' })  // ← Tidak ada token
```

**AD-2 [PENTING]:** Site ID tidak divalidasi format — hanya bisa alphanumeric+hyphen tapi tidak ada validasi.

**AD-3 [MINOR]:** `alert()` dan `confirm()` native digunakan untuk semua feedback.

---

## 📊 PETA STATUS LENGKAP SEMUA FUNGSI

### ✅ FUNGSI BERFUNGSI BAIK (38 Fungsi)
- Editor: auto-save, block editor, AI generate, SEO meta, version history, category picker, editorial flags, tag manager
- Review: tab workflow, modal setujui, kirim revisi, terbitkan artikel, role guard
- KYC Admin: list + filter + pagination, stats cards, trend chart, refresh, navigasi ke detail
- Audit Log: seluruh 10 fungsi (sempurna)
- Komentar: list pending, setujui, tolak, loading skeleton
- Kategori: list, create, auto-slug, hapus lokal, global toggle

### ⚠️ FUNGSI BERMASALAH (17 Fungsi)
- **Manajemen Situs**: fetch, create, edit, delete (semua gagal - no auth header)
- **Pengguna**: fetch users (gagal - no auth header), URL site parsing (salah regex)
- **Kategori**: create, delete (gagal - no auth header)
- **KYC Admin**: fetch stats, fetch users (URL hardcoded localhost)
- **Monitor Tim**: isOnline status (fake), tombol profil & ⋮ (no-op)
- **Komentar**: filter, search, stats "hari ini", tombol detail (no-op)
- **Pengaturan**: load, save (endpoint tidak ada)

### ❌ FUNGSI TIDAK ADA SAMA SEKALI
- Edit Kategori (ubah nama/slug)
- Edit/Suspend/Delete Pengguna
- Undang Anggota (Invitation UI)
- Kalender publikasi (backend tidak ada)
- Export Audit Log

---

## 🔎 ANALISIS KONSISTENSI DESAIN

### Inkonsistensi yang Ditemukan:

| Aspek | Halaman Baik | Halaman Bermasalah |
|---|---|---|
| HTTP Client | `api` axios (Review, Audit, Komentar) | `fetch` native (Admin, Users, Categories, KYC) |
| Konfirmasi | Modal (Review - setujui) | `confirm()` (Editor, Categories, Review-revisi) |
| Error feedback | console.error (silent) | `alert()` |
| Site ID parsing | `useParams()` (Review, Audit) | `window.location.pathname` (Users, Categories) |
| Loading state | Skeleton (Komentar, Artikel) | "Loading..." text (Users) |

**Kesimpulan:** Ada ketidakkonsistenan yang signifikan dalam cara berbeda halaman menangani HTTP requests, feedback error, dan parsing URL. Beberapa halaman tampaknya dibuat oleh kontributor berbeda tanpa standar yang disepakati.

---

## 🗺️ ROADMAP PERBAIKAN TERSTRUKTUR

### 🚨 Sprint 1 — Auth Fix (1-2 hari)
Prioritas: **ganti semua `fetch()` native dengan `api` axios instance**

- [ ] `admin/page.tsx` — 3 fungsi (list, CRUD, delete)
- [ ] `users/page.tsx` — 1 fungsi (fetch users) + fix regex URL parsing
- [ ] `categories/page.tsx` — 2 fungsi (create, delete) + fix regex URL parsing
- [ ] `review/kyc/page.tsx` — 2 fungsi (fetchStats, fetchUsers) + hapus `localhost` hardcode

### ⚠️ Sprint 2 — Endpoint & Fungsi Inti (1 minggu)
- [ ] Buat endpoint `GET/PATCH /api/v1/sites/settings` di backend
- [ ] Buat endpoint `GET /api/v1/users/stats` di backend (jika belum ada)
- [ ] Implementasi **Edit Kategori** (form rename)
- [ ] Tambahkan tombol aksi di tabel Pengguna (edit role, suspend)
- [ ] Perbaiki tombol Reject di Review Queue
- [ ] Hubungkan filter & search di halaman Komentar ke API

### 🔧 Sprint 3 — Kualitas & UX (2 minggu)
- [ ] Ganti semua `alert()`/`confirm()` dengan toast + modal konfirmasi
- [ ] Filter server-side di Antrian Review (kirim `status` param ke API)
- [ ] Tambahkan pagination/search di halaman Pengguna
- [ ] Tambahkan menu Undangan di sidebar + halaman invitation management
- [ ] Implementasikan status online yang nyata di Monitor Tim (polling/WebSocket)
- [ ] Ganti `require('recharts')` dengan import ES Module di KYC admin
- [ ] Tambahkan fitur upload gambar langsung di editor (bukan hanya URL paste)
- [ ] Tambahkan export CSV di Audit Log
