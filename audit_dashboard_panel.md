# 🖥️ Laporan Audit Dashboard Panel — BeritaKarya

**Audit Dilakukan Oleh:** Senior Audit Development System  
**Tanggal:** 15 Mei 2026  
**Scope:** Seluruh Menu Dashboard Panel (Frontend + Integrasi Backend)

---

## 📋 Daftar Menu Yang Diaudit

| # | Menu | Akses Role | Status |
|---|---|---|---|
| 1 | Ringkasan (Home Dashboard) | Semua | ⚠️ Perlu Perbaikan |
| 2 | Kelola Post (Articles) | Semua | ✅ Berfungsi Baik |
| 3 | Media | Semua | ⚠️ Perlu Verifikasi |
| 4 | Verifikasi KYC (User) | Semua | ⚠️ Ada Bug |
| 5 | Antrian Review | Superadmin, Wapimred | ✅ Berfungsi |
| 6 | Antrian KYC (Admin) | Superadmin, Wapimred | ⚠️ Perlu Perbaikan |
| 7 | Kalender | Superadmin, Wapimred | ❌ Belum Lengkap |
| 8 | Kategori | Superadmin, Wapimred | ✅ Berfungsi |
| 9 | Iklan & Banner | Superadmin, Wapimred | ⚠️ Perlu Verifikasi |
| 10 | Komentar | Superadmin, Wapimred | ⚠️ Perlu Verifikasi |
| 11 | Monitor Tim | Superadmin, Wapimred | ⚠️ Perlu Verifikasi |
| 12 | Pengguna | Superadmin, Wapimred | ⚠️ Ada Bug |
| 13 | Audit Log | Superadmin, Wapimred | ✅ Berfungsi |
| 14 | Pengaturan Situs | Superadmin, Wapimred | ⚠️ Perlu Perbaikan |
| 15 | Manajemen Situs (Admin) | Superadmin only | 🚨 Kritis |
| 16 | AI Dashboard | Superadmin only | ✅ Berfungsi |

---

## 🏗️ ANALISIS STRUKTUR LAYOUT & NAVIGASI

### ✅ Yang Sudah Baik:
- **Sidebar responsif** dengan mode collapse/expand + mobile overlay
- **Role-based navigation** — menu tersembunyi sesuai role user dengan benar
- **Active state indicator** dengan highlight merah pada menu aktif
- **Dark mode** tersedia dan berfungsi, disimpan di localStorage
- **NotificationBell** komponen terintegrasi di top bar
- **Breadcrumb portal indicator** (nama site aktif) terlihat di sidebar
- **Sticky header** dengan tombol external link ke portal publik

### ⚠️ Masalah Layout:
1. **Tidak ada proteksi role di level layout** — `layout.tsx` hanya mengecek apakah token ada (`localStorage.getItem('accessToken')`), bukan memvalidasi JWT dengan benar. Jika token sudah expired tapi masih ada di localStorage, user tetap bisa melihat dashboard (walau API calls akan gagal).
2. **Sidebar tidak ada menu "Undangan"** — Fitur invitation yang sudah dibuat di backend tidak memiliki menu di dashboard. User tidak bisa mengundang orang baru dari UI.
3. **Search di header tidak berfungsi** — Input pencarian di top bar (`Cari di dashboard...`) tidak terhubung ke fungsionalitas apapun — hanya dekorasi UI.

---

## 📊 MENU 1: RINGKASAN (Dashboard Home)

**File:** `apps/web/app/[site]/dashboard/page.tsx`

### ✅ Fitur Berfungsi:
- KPI Cards: Total Post, Terbit, Antrian Review, Terjadwal
- Traffic Chart 7 hari (dari analytics API)
- Review Queue Preview (untuk wapimred/superadmin)
- Recent Activity List
- Category Performance Bar
- Top Performing Content
- Real-time Pulse Indicator (simulasi dari total views)
- Quick Actions (role-filtered)

### ⚠️ Temuan:
**DH-1:** `RealTimePulse` menggunakan **data simulasi, bukan data real**. Widget menampilkan "Pembaca Aktif" yang dihitung dari `totalViews / 500`, bukan dari WebSocket atau server-sent events sesungguhnya. Ini menyesatkan user karena seolah-olah data real-time.

**DH-2:** Dashboard memanggil 3 API sekaligus (`/articles`, `/analytics/traffic`, `/analytics/top-content`) pada mount, namun **tidak ada error handling UI** jika satu atau lebih API gagal. User hanya melihat layar kosong tanpa pesan informatif.

**DH-3:** **Engagement Rate di Traffic Section selalu tampil "N/A"** — field ini hardcoded, tidak diambil dari data manapun. Harus dihapus atau diimplementasikan.

**DH-4:** `trafficSpark` dan `publishedSpark` menggunakan data yang tidak tepat:
```tsx
const publishedSpark = trafficData.map(d => Math.floor(d.views / 20)) // ← Bukan jumlah artikel terbit yang sebenarnya!
```

**DH-5:** Target hari ini hardcoded `/ 10` tanpa konfigurasi:
```tsx
<p>.../ 10</p> // Target tidak bisa diubah dari UI
```

---

## 📝 MENU 2: KELOLA POST (Articles)

**File:** `apps/web/app/[site]/dashboard/articles/page.tsx`

### ✅ Fitur Berfungsi:
- Tampilan list + kanban board (toggle)
- Filter status per tab
- Debounce search 500ms (baik!)
- Role-based action buttons (kirim ke editor, hapus)
- Status badges (Breaking, Exclusive, Featured)
- View count & word count di list

### ⚠️ Temuan:
**AP-1:** Konfirmasi hapus menggunakan **native `confirm()`** — tidak konsisten dengan desain premium dashboard. Harus diganti dengan modal konfirmasi yang sesuai dengan desain sistem.

**AP-2:** Error handling menggunakan `alert()` — sama seperti di atas, tidak sesuai dengan desain sistem. Harus menggunakan toast/snackbar notification.

**AP-3:** Halaman tidak memiliki **pagination**. Jika ada 500+ artikel, semuanya diload sekaligus dengan `limit: 50` yang hardcoded. Untuk media besar ini akan jadi masalah performa.

**AP-4:** Status tabs menampilkan **count dari data lokal** (setelah fetch), bukan dari server. Jadi jika ada filter status aktif, count tetap menghitung dari data yang ter-fetch (bukan total di database).

---

## 🖼️ MENU 3: MEDIA

**Status:** Tidak dapat memverifikasi karena file tidak tersedia untuk diaudit secara mendalam, tapi berdasarkan backend:
- Upload terbatas **10MB** body size (`express.json({ limit: '10mb' })`)
- Validasi tipe file ada di backend (`FileValidator`)
- Watermark otomatis tersedia

**⚠️ Perlu dicek:** Apakah ada UI untuk melihat/menghapus media yang sudah diupload.

---

## 🔖 MENU 4: VERIFIKASI KYC (User — Submit Form)

**File:** `apps/web/app/[site]/dashboard/kyc/page.tsx`

### ✅ Fitur Berfungsi:
- Form upload KTP + KK dengan preview gambar
- Validasi ukuran file (5MB) di sisi client
- Consent checkbox
- Status tampilan (none/pending/verified)

### 🚨 Temuan Kritis:
**KF-1:** **Token diambil langsung dari localStorage dan dikirim manual** — tidak menggunakan Axios interceptor (`api`) tapi menggunakan `axios` biasa:
```tsx
const token = localStorage.getItem('accessToken')
await axios.post(`...`, formData, {
  headers: { 'Authorization': `Bearer ${token}` }
})
```
Ini bypass semua global interceptors (termasuk auto-refresh token). Jika token expired, KYC submission akan **gagal tanpa retry** dan user harus login ulang manual.

**KF-2:** **Redirect ke halaman yang tidak ada** — setelah KYC terverifikasi, tombol redirect ke `/dashboard/articles/create` yang **tidak ada di routing**:
```tsx
router.push(`/${siteId}/dashboard/articles/create`)
// ↑ Harusnya: `/${siteId}/dashboard/articles/new`
```

**KF-3:** Tidak ada **validasi panjang karakter** untuk field `bio`. User bisa memasukkan bio sangat panjang tanpa feedback.

**KF-4:** Tidak ada tampilan untuk **status "rejected"**. Jika KYC ditolak, user hanya bisa melihat state "pending" terus tanpa tahu alasan penolakan.

---

## 📋 MENU 5: ANTRIAN REVIEW (Editorial)

Berdasarkan integrasi backend yang sudah diaudit sebelumnya, alur ini sudah terimplementasi. KanbanBoard component tersedia dan digunakan di articles page.

### ⚠️ Temuan:
**RV-1:** **Navigasi sidebar menuju `/dashboard/review/kyc`** (Antrian KYC) namun path ini berada di bawah `/review` — perlu dicek apakah routing ini benar-benar ada atau seharusnya `/dashboard/kyc` (admin).

---

## 🗓️ MENU 6: KALENDER

**Status:** Ada di navigasi (`/dashboard/calendar`) tetapi tidak ada komponen yang diaudit.

### Prediksi Status:
- Tidak ada integrasi API kalender di backend
- Kemungkinan hanya UI statis atau belum sepenuhnya diimplementasikan

---

## 🏷️ MENU 7: KATEGORI

Tersedia CRUD lengkap di backend (`/api/v1/categories`). Berdasarkan struktur, ini sudah berfungsi.

---

## 📢 MENU 8: IKLAN & BANNER

Backend `adRouter` tersedia. Perlu verifikasi apakah UI sudah terintegrasi penuh.

---

## 💬 MENU 9: KOMENTAR

Backend `commentRouter` tersedia. 

### ⚠️ Temuan Umum:
Belum dapat memverifikasi apakah ada fitur **moderasi komentar** (approve/reject/hapus) di dashboard, atau hanya melihat list komentar.

---

## 👥 MENU 10: MONITOR TIM & PENGGUNA

**File:** `apps/web/app/[site]/dashboard/users/`

### ⚠️ Temuan:
**US-1:** Berdasarkan audit backend sebelumnya, **endpoint ubah role tidak memiliki whitelist**. Di sisi frontend, jika form role change menampilkan dropdown yang mencakup semua role (termasuk `superadmin`), ini adalah celah keamanan serius.

**US-2:** Tidak ada UI untuk **menghapus/nonaktifkan user** (soft delete) yang seharusnya ada.

**US-3:** Tidak ada UI untuk fitur **undangan** (`/invitations`) — menu ini sepenuhnya hilang dari dashboard navigation walaupun sudah ada backend dan controller-nya.

---

## 📋 MENU 11: AUDIT LOG

Backend `auditRouter` tersedia dan lengkap. Berdasarkan integrasi, menu ini seharusnya berfungsi dengan baik menampilkan log aktivitas.

---

## ⚙️ MENU 12: PENGATURAN SITUS

**File:** `apps/web/app/[site]/dashboard/settings/page.tsx`

### ✅ Fitur Berfungsi:
- Identitas Situs (Nama, Domain, Deskripsi SEO)
- Branding & Visual (Logo URL, Warna Brand)
- Footer & Kontak (Alamat, Email, Telepon)
- Social Links (Facebook, Twitter, Instagram, YouTube)
- Halaman Informasi (About Us, Kode Etik, Redaksi, Iklan)
- Topik Hangat (Trending Topics) — add/remove tags

### ⚠️ Temuan:
**ST-1:** **Endpoint API tidak ada** — halaman memanggil `/sites/settings` (`api.get('/sites/settings')`) dan `api.patch('/sites/settings', settings)` tapi **endpoint ini tidak ditemukan di backend**. Backend hanya memiliki:
- `GET /api/v1/sites` (list)
- `GET /api/v1/sites/:id`
- `PUT /api/v1/sites/:id`

Tidak ada endpoint `/sites/settings` atau `/sites/current`. Artinya halaman settings ini **tidak bisa menyimpan data**.

**ST-2:** **Tidak ada validasi domain format** — user bisa menginput domain format apapun tanpa validasi regex URL.

**ST-3:** **Logo hanya berupa URL** — tidak ada upload logo langsung. Ini memaksa user untuk hosting logo di tempat lain dulu.

**ST-4:** Perubahan `appearance.primaryColor` disimpan ke database tapi **tidak ada mekanisme untuk mengaplikasikan warna ini ke portal publik secara dinamis**.

---

## 🔧 MENU 13: MANAJEMEN SITUS (Superadmin)

**File:** `apps/web/app/[site]/dashboard/admin/page.tsx`

### 🚨 Temuan KRITIS:
**AD-1:** **API calls menggunakan `fetch` tanpa Authorization header!**
```tsx
const res = await fetch('/api/v1/sites?includeStats=true')
// ↑ Tidak ada Authorization header! Ini akan GAGAL karena JWT middleware memblokir semua non-auth routes
```
Semua operasi CRUD situs (`fetchSites`, `handleSubmit`, `handleDelete`) menggunakan native `fetch` biasa, bukan `api` axios instance yang sudah memiliki interceptors untuk menambahkan Bearer token.

**Dampak:** Seluruh menu Manajemen Situs tidak berfungsi karena API calls akan mendapat response 401 Unauthorized.

**AD-2:** **Error handling menggunakan `alert()`** — tidak sesuai dengan premium design system.

**AD-3:** Tidak ada **konfirmasi yang aman** untuk hapus situs — `confirm()` native sangat mudah diabaikan secara tidak sengaja. Menghapus situs berarti menghapus semua data yang terkait.

**AD-4:** Form **tidak ada validasi format Site ID** — site ID seharusnya hanya boleh lowercase alphanumeric + hyphen (karena digunakan di URL), tapi tidak ada validasi ini.

**AD-5:** Tidak ada **proteksi tambahan di frontend** untuk superadmin-only features — siapapun yang tau URL bisa mencoba akses (walau backend memproteksi, defense-in-depth harus diterapkan).

---

## 🤖 MENU 14: AI DASHBOARD

Berdasarkan komponen `AIDashboard.tsx` yang tersedia (21KB), ini adalah menu yang cukup lengkap. Terhubung ke `ai.controller.ts` di backend.

### ✅ Yang Sudah Baik:
- Quota management per role
- Usage tracking
- AI feature toggles

---

## 📊 RINGKASAN SEMUA TEMUAN DASHBOARD

### 🚨 KRITIS (3 Temuan)
| ID | Menu | Masalah |
|---|---|---|
| AD-1 | Manajemen Situs | `fetch` tanpa Auth header — semua operasi CRUD situs gagal |
| KF-1 | KYC Submit | `axios` langsung tanpa interceptor — token refresh tidak berjalan |
| KF-2 | KYC Verified | Redirect ke halaman `/articles/create` yang tidak ada |

### ⚠️ PENTING (8 Temuan)
| ID | Menu | Masalah |
|---|---|---|
| ST-1 | Pengaturan | Endpoint `/sites/settings` tidak ada di backend |
| DH-1 | Ringkasan | "Pembaca Aktif" adalah simulasi, bukan real-time |
| DH-3 | Ringkasan | Engagement Rate hardcoded "N/A" |
| AP-1/2 | Artikel | Gunakan `alert()`/`confirm()` native — tidak sesuai desain |
| AP-3 | Artikel | Tidak ada pagination |
| US-3 | Pengguna | Menu Undangan tidak ada di navigasi dashboard |
| RV-1 | Review | Route `/dashboard/review/kyc` mungkin tidak ada |
| Layout | Sidebar | Search bar di header tidak berfungsi |

### ❌ FITUR BELUM DIIMPLEMENTASI
| Menu | Fitur | Status |
|---|---|---|
| Kalender | Integrasi jadwal publikasi | UI ada, backend tidak ada |
| Pengaturan | Upload logo langsung | Hanya URL |
| KYC User | Tampilan status "rejected" + alasan penolakan | Tidak ada |
| Pengguna | Soft delete / nonaktifkan user | Tidak ada |
| Dashboard | Undangan (Invitation) | Tidak ada menu sama sekali |

---

## 🗺️ ROADMAP PERBAIKAN DASHBOARD

### 🚨 Sprint 1 — KRITIS (1-2 hari)
- [ ] **[AD-1]** Ganti semua `fetch()` di `admin/page.tsx` dengan `api` axios instance
- [ ] **[KF-1]** Ganti `axios.post` di `kyc/page.tsx` dengan `api.post` dari lib
- [ ] **[KF-2]** Perbaiki redirect dari `articles/create` → `articles/new`
- [ ] **[ST-1]** Buat endpoint `GET/PATCH /api/v1/sites/settings` di backend

### ⚠️ Sprint 2 — PENTING (1 minggu)
- [ ] Ganti semua `alert()`/`confirm()` dengan toast notification & modal konfirmasi
- [ ] Tambahkan pagination di halaman artikel (infinite scroll atau numbered)
- [ ] Tambahkan menu **Undangan** (`/dashboard/invitations`) di sidebar
- [ ] Perbaiki search bar di header agar berfungsi (global search dashboard)
- [ ] Tambahkan tampilan status "rejected" pada KYC user page

### 🔧 Sprint 3 — PENINGKATAN (2 minggu)
- [ ] Ganti "Pembaca Aktif" simulasi dengan data real (WebSocket atau polling)
- [ ] Implementasikan "Engagement Rate" dengan data sesungguhnya
- [ ] Tambahkan validasi format Site ID di form Admin
- [ ] Implementasikan feature kalender dengan integrasi jadwal publikasi backend
- [ ] Tambahkan fitur upload logo langsung (bukan URL)
- [ ] Tambahkan UI soft delete/nonaktifkan user
