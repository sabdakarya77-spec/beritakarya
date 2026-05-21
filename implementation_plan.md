# Sinkronisasi Kategori: Homepage → Dashboard/Kategori & Editorial Sidebar

## Ringkasan Masalah

Saat ini, tiga komponen menggunakan kategori:

| Komponen | Sumber Data | Masalah |
|---|---|---|
| **Homepage** (Navbar/PublicSiteLayout) | API `/categories/tree` + fallback `CATEGORIES_CONFIG` | ✅ Sumber utama (acuan) |
| **Dashboard/Kategori** (`categories/page.tsx`) | API `/categories/tree` tetapi **tanpa `site` param** | ⚠️ Tidak melewatkan `siteId` sehingga mengandalkan cookie/interceptor |
| **Editorial Sidebar** (`EditorialSidebar.tsx`) | API `/categories/tree` dengan `site` param dari store | ⚠️ Tergantung `siteId` dari editor store |

### Masalah Utama yang Ditemukan

1. **Dashboard/Kategori** memanggil `/categories/tree` **tanpa parameter `site`** secara eksplisit di request (mengandalkan axios interceptor `X-Site-ID` dari cookie). Jika cookie belum di-set atau user mengakses langsung, bisa return data yang salah.

2. **Editorial Sidebar** sudah melewatkan `siteId` dari editor store, tapi hanya saat `siteId` ada nilainya — jika `siteId` kosong/undefined, akan fetch tanpa filter site.

3. **Homepage** (`PublicSiteLayout`) memanggil API **tanpa `site` param** — hanya mengandalkan interceptor cookie juga.

4. **`CATEGORIES_CONFIG` (static fallback)** di `constants.ts` bisa **out-of-sync** dengan data dari database jika admin menambahkan/mengubah kategori lewat Dashboard.

## Proposed Changes

### Komponen 1: Dashboard/Kategori

#### [MODIFY] [page.tsx](file:///d:/beritakarya/apps/web/app/[site]/dashboard/categories/page.tsx)

- Melewatkan `siteId` secara eksplisit ke API call `/categories/tree` (bukan hanya mengandalkan interceptor)
- Menambahkan `siteId` sebagai dependency pada `useEffect` agar re-fetch saat site berubah

```diff
 const fetchCategories = async () => {
   try {
     const queryParams: Record<string, string> = {};
     if (isGlobalView) {
       queryParams.view = 'all';
+    } else {
+      queryParams.site = siteId;
     }
```

---

### Komponen 2: PublicSiteLayout (Homepage)

#### [MODIFY] [PublicSiteLayout.tsx](file:///d:/beritakarya/apps/web/components/layout/PublicSiteLayout.tsx)

- Melewatkan `siteConfig.id` ke API call `/categories/tree` sehingga tidak bergantung pada cookie interceptor
- Menambahkan `siteConfig.id` sebagai dependency di `useEffect`

```diff
- const { data } = await api.get('/categories/tree');
+ const { data } = await api.get('/categories/tree', {
+   params: { site: siteConfig.id }
+ });
```

- Ini memastikan Homepage selalu mengambil kategori yang benar sesuai site.

---

### Komponen 3: Editorial Sidebar  

#### [MODIFY] [EditorialSidebar.tsx](file:///d:/beritakarya/apps/web/components/editor/EditorialSidebar.tsx)

- Sudah cukup baik, hanya perlu memastikan fallback `siteId` dari params URL jika store kosong

```diff
  const { data } = await api.get('/categories/tree', {
-   params: siteId ? { site: siteId } : undefined
+   params: { site: siteId || (params.site as string) || 'pusat' }
  });
```

> **Catatan:** Editorial Sidebar tidak punya akses langsung ke `useParams()`. Pendekatan yang lebih tepat adalah memastikan `siteId` di editor store selalu terisi saat editor dimuat.

---

### Komponen 4: SiteHomePage (Server Component)

#### [MODIFY] [SiteHomePage.tsx](file:///d:/beritakarya/apps/web/components/pages/SiteHomePage.tsx)

- Sudah benar: memanggil `getCategories(siteConfig.id)` dan melewatkan `site` param ke URL
- Tidak perlu perubahan signifikan, tetapi fallback ke `CATEGORIES_CONFIG` harus dihapus karena bisa menyebabkan inkonsistensi

```diff
 function resolveCategoryName(slug: string, categoriesTree: any[] = []): string {
   if (slug === 'Terbaru') return 'Terbaru'
   if (slug === 'Tersimpan') return 'Tersimpan'
   for (const cat of categoriesTree) {
     if (cat.slug === slug) return cat.name
     if (cat.subCategories) {
       for (const sub of cat.subCategories) {
         if (sub.slug === slug) return `${cat.name} / ${sub.name}`
       }
     }
   }
-  for (const cat of CATEGORIES_CONFIG) {
-    if (cat.slug === slug) return cat.name
-    if (cat.subCategories) {
-      for (const sub of cat.subCategories) {
-        if (sub.slug === slug) return `${cat.name} / ${sub.name}`
-      }
-    }
-  }
   return slug
 }
```

- Menghapus fallback statis agar kategori selalu konsisten dengan data dari database (sumber kebenaran tunggal / single source of truth).

---

## Ringkasan Perubahan

| File | Perubahan |
|---|---|
| `categories/page.tsx` (Dashboard) | Tambah explicit `site` param pada API call |
| `PublicSiteLayout.tsx` (Homepage) | Tambah explicit `site` param, tambah dependency `siteConfig.id` di useEffect |
| `EditorialSidebar.tsx` (Editor Sidebar) | Pastikan `siteId` selalu ada di API call |
| `SiteHomePage.tsx` (Homepage SSR) | Hapus fallback `CATEGORIES_CONFIG` pada `resolveCategoryName` |

## Verification Plan

### Manual Verification
1. Buat kategori baru di Dashboard/Kategori → Pastikan muncul di:
   - Homepage (navbar navigation)
   - Editorial Sidebar (dropdown kategori post)
   - Dashboard/Kategori (tabel)
2. Hapus kategori di Dashboard → Pastikan hilang dari ketiga tempat
3. Edit nama/order kategori → Pastikan update konsisten di semua tempat
