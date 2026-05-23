# UI/UX Task Board Template - BeritaKarya

Gunakan template ini untuk membuat task implementasi UI/UX yang jelas, terukur, dan mudah direview.

---

## Template Kartu Task

```md
Title:
Area:
Priority:
Sprint:
Owner:
Reviewer:

Problem:

Why It Matters:

Expected UX Outcome:

Scope:
- 
- 
- 

Files:
- 
- 

Dependencies:
- 

Implementation Notes:
- 
- 

Acceptance Criteria:
- [ ]
- [ ]
- [ ]

Manual QA Checklist:
- [ ]
- [ ]
- [ ]

Risks:
- 

Out of Scope:
- 
```

---

## Template Kolom Board

Gunakan struktur board berikut:

1. `Backlog`
2. `Ready`
3. `In Progress`
4. `Review`
5. `Blocked`
6. `Done`

---

## Template Epic

```md
Epic:
Objective:
Success Metrics:
- 
- 

Related Docs:
- docs/UI_UX_PRIORITY_ACTION_PLAN.md
- docs/UI_UX_EXECUTION_PLAYBOOK.md
- docs/UI_UX_TECHNICAL_DELIVERY_KIT.md

Included Tasks:
- 
- 
- 

Out of Scope:
- 
```

---

## Contoh Kartu Task 1

```md
Title: Sinkronkan route legal footer dengan halaman info yang tersedia
Area: Trust Layer
Priority: P1
Sprint: Sprint 1
Owner: Frontend
Reviewer: Lead FE / Product

Problem:
Footer masih menampilkan beberapa link legal yang belum selaras dengan route yang tersedia.

Why It Matters:
Dead link dan route palsu menurunkan trust user.

Expected UX Outcome:
Semua link legal footer valid, jelas, dan konsisten dengan struktur informasi publik.

Scope:
- Audit seluruh link legal di footer
- Putuskan mapping route final
- Sesuaikan implementasi footer

Files:
- apps/web/components/layout/SiteFooter.tsx
- apps/web/app/[site]/p/[slug]/page.tsx

Dependencies:
- Keputusan route legal final

Implementation Notes:
- Hapus link yang belum siap bila belum ada route final
- Jangan hardcode route global jika site context diperlukan

Acceptance Criteria:
- [ ] Semua link legal footer valid
- [ ] Tidak ada route 404 dari footer
- [ ] Footer tetap rapi setelah perubahan

Manual QA Checklist:
- [ ] Test desktop
- [ ] Test mobile
- [ ] Test site pusat dan non-pusat

Risks:
- Ada link lama yang mungkin sudah tersebar

Out of Scope:
- Redesign visual footer total
```

---

## Contoh Kartu Task 2

```md
Title: Ringkas struktur atas homepage agar feed utama lebih cepat terlihat
Area: Homepage Focus
Priority: P1
Sprint: Sprint 2
Owner: Frontend
Reviewer: Product / Design

Problem:
Terlalu banyak blok unggulan muncul sebelum feed utama.

Why It Matters:
User kesulitan memahami fokus halaman dan perlu scroll terlalu jauh sebelum masuk arus baca utama.

Expected UX Outcome:
Homepage terasa lebih fokus dan feed utama muncul lebih cepat.

Scope:
- Evaluasi blok hero, fokus editor, video, opini, foto, sidebar
- Kurangi blok awal yang tidak prioritas
- Pertahankan karakter visual editorial

Files:
- apps/web/components/pages/SiteHomePage.tsx

Dependencies:
- Keputusan final struktur homepage

Implementation Notes:
- Jangan hilangkan karakter brand
- Fokus pada hierarchy, bukan menambah efek baru

Acceptance Criteria:
- [ ] Feed utama lebih cepat terlihat
- [ ] Hero tetap kuat
- [ ] Homepage tidak terasa terlalu penuh

Manual QA Checklist:
- [ ] Test desktop
- [ ] Test mobile
- [ ] Test kategori aktif

Risks:
- Terlalu banyak pengurangan bisa membuat homepage terasa kosong

Out of Scope:
- Membangun sistem section homepage baru dari nol
```

---

## Format Task Singkat

Jika tim butuh versi ringkas, gunakan format berikut:

```md
Title:
Priority:
Owner:
Files:
Goal:
Acceptance:
- [ ]
- [ ]
```

---

## Catatan

Task UI/UX yang baik harus:

- punya masalah yang jelas,
- punya outcome UX yang jelas,
- menyebut file yang disentuh,
- punya acceptance criteria,
- dan bisa diuji manual dengan cepat.

Hindari task seperti:

- "rapikan UI"
- "bikin lebih modern"
- "perbagus dashboard"
- "kasih animasi biar hidup"

Karena task seperti itu terlalu kabur untuk dieksekusi dan direview.

