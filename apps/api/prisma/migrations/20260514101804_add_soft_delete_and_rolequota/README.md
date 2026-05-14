# Migration: 20260514101804_add_soft_delete_and_rolequota

## Tujuan
Menambahkan:
1. Soft delete support untuk Site, User, Article, Category
2. RoleQuota table untuk AI quota management
3. Indexes untuk optimize soft delete queries

## Perubahan

### Soft Delete Fields
- Site.deletedAt
- User.deletedAt
- Article.deletedAt
- Category.deletedAt

### RoleQuota Table
- role (PK)
- dailyRequests
- dailyTokens
- monthlyBudget
- allowedFeatures (JSON)
- modelRestriction (nullable)

## Default Data
RoleQuota diisi dengan 5 role default:
- superadmin: unlimited
- wapimred: 500 req/hari, $500/bulan
- editor: 200 req/hari, $50/bulan
- reporter: 100 req/hari, $25/bulan, GPT-3.5 only
- reader: 0 (trial only)

## cara Apply
```bash
pnpm prisma migrate deploy
```

## Rollback (jika diperlukan)
```bash
pnpm prisma migrate resolve --rolled-back "migration_name"
```

## Notes
- Migration ini compatibility dengan schema.prisma yang sudah memiliki deletedAt fields
- Memerlukan Prisma Client version >= 5.0
