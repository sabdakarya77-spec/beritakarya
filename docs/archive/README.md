# 🗄️ Archive Documentation

**Last Updated:** May 14, 2026  
**Purpose:** Legacy and deprecated documentation storage  
**Audience:** DevOps, Tech Leads (for historical reference only)

---

## 📋 What's Inside

This folder contains **archived documentation** that is no longer actively maintained but kept for:

- Historical reference
- Compliance/audit purposes
- Migration tracking
- Deprecated features documentation

**⚠️ Note:** Files here are **outdated**. Always check main docs first!

---

## 📦 Archived Files

### Production Planning (Superseded by `../PRODUCTION/PLANNING.md`)

| Original File | Content Status | Superseded By |
|---------------|----------------|---------------|
| `AI_PLAN.md` | ✅ Integrated into PLANNING.md | `../PRODUCTION/PLANNING.md` |
| `PRODUCTION_READINESS_REPORT.md` | ✅ Integrated into PLANNING.md | `../PRODUCTION/PLANNING.md` |
| `PRODUCTION_ACTION_ITEMS.md` | ✅ Integrated into PLANNING.md | `../PRODUCTION/PLANNING.md` |

**Why archived:** These three files were consolidated into a single comprehensive planning document for better organization.

---

### Database Documentation

| Original File | Content Status | Moved To |
|---------------|----------------|----------|
| `INFRASTRUCTURE_DATABASE_SUMMARY.md` | ✅ Moved | `../DATABASE/INFRASTRUCTURE.md` |

---

### Production Reports

| Original File | Content Status | Moved To |
|---------------|----------------|----------|
| `PRODUCTION_DATABASE_VERIFICATION_REPORT.md` | ✅ Moved | `../PRODUCTION/VERIFICATION.md` |
| `PRODUCTION_LAUNCH_SUMMARY.md` | ✅ Moved | `../PRODUCTION/LAUNCH_SUMMARY.md` |

---

### Deployment & Operations

| Original File | Content Status | Moved To |
|---------------|----------------|----------|
| `docs/deployment/PRODUCTION_DEPLOYMENT_GUIDE.md` | ✅ Moved | `../DEPLOYMENT/BACKEND.md` |
| `docs/operations/RUNBOOK_POST_LAUNCH_MONITORING.md` | ✅ Moved | `../OPERATIONS/MONITORING.md` |

---

## 🗂️ Organization

```
ARCHIVE/
├── root/                     # Files from project root
│   ├── AI_PLAN.md
│   ├── PRODUCTION_READINESS_REPORT.md
│   ├── PRODUCTION_ACTION_ITEMS.md
│   ├── INFRASTRUCTURE_DATABASE_SUMMARY.md
│   ├── PRODUCTION_DATABASE_VERIFICATION_REPORT.md
│   └── PRODUCTION_LAUNCH_SUMMARY.md
│
└── docs/                     # Files from docs/ subfolder
    ├── deployment/
    │   └── PRODUCTION_DEPLOYMENT_GUIDE.md
    └── operations/
        └── RUNBOOK_POST_LAUNCH_MONITORING.md
```

---

## 📅 Migration Timeline

**Date:** May 14, 2026

**Action:** Consolidated scattered documentation into organized folder structure:

1. ✅ Created `docs/PRODUCTION/` with:
   - PLANNING.md (combined 3 planning documents)
   - VERIFICATION.md
   - LAUNCH_SUMMARY.md

2. ✅ Created `docs/DATABASE/` with:
   - INFRASTRUCTURE.md
   - README.md

3. ✅ Created `docs/DEPLOYMENT/` with:
   - BACKEND.md
   - README.md

4. ✅ Created `docs/OPERATIONS/` with:
   - MONITORING.md
   - README.md

5. ✅ Created `docs/EDITORIAL/` with:
   - WORKFLOW.md (existing)
   - README.md

6. ✅ Created `docs/INFRASTRUCTURE/` with:
   - DOCKER.md, NGINX.md, SCRIPTS.md (to be created)
   - README.md

7. ✅ Created `docs/README.md` (central index)

**Total files reorganized:** 8 core documents + 8 READMEs

---

## 🔍 Why Archive Instead of Delete?

1. **Audit Trail:** Track documentation evolution
2. **Compliance:** Retain records for regulatory purposes
3. **Reference:** Old data may be needed for historical comparisons
4. **Rollback:** If new structure has issues, old files are available
5. **Knowledge Preservation:** Original author insights preserved

---

## ⚠️ Important Notes

### DO NOT Use Archived Files For:

- ❌ Current deployment procedures (use `../DEPLOYMENT/BACKEND.md`)
- ❌ Production planning (use `../PRODUCTION/PLANNING.md`)
- ❌ Database setup (use `../DATABASE/INFRASTRUCTURE.md`)
- ❌ Monitoring procedures (use `../OPERATIONS/MONITORING.md`)
- ❌ Editorial workflows (use `../EDITORIAL/WORKFLOW.md`)

### Always Verify:

- [ ] You're reading the latest version in main docs
- [ ] Cross-reference with central index: `docs/README.md`
- [ ] Check file modification dates (newer = more current)
- [ ] Follow redirects from old paths to new paths

---

## 🔗 Current Documentation Structure

```
docs/
├── README.md                    # Central index - START HERE
├── PRODUCTION/
│   ├── README.md               # Production docs index
│   ├── PLANNING.md             # ⭐ Main planning document
│   ├── VERIFICATION.md         # Database verification results
│   └── LAUNCH_SUMMARY.md       # Executive summary
│
├── DATABASE/
│   ├── README.md               # Database docs index
│   └── INFRASTRUCTURE.md       # Database setup & maintenance
│
├── DEPLOYMENT/
│   ├── README.md               # Deployment docs index
│   └── BACKEND.md              # ⭐ Deployment procedures
│
├── OPERATIONS/
│   ├── README.md               # Operations docs index
│   └── MONITORING.md           # ⭐ Monitoring runbook
│
├── EDITORIAL/
│   ├── README.md               # Editorial docs index
│   └── WORKFLOW.md             # Editorial workflow
│
├── INFRASTRUCTURE/
│   ├── README.md               # Infrastructure docs index
│   ├── DOCKER.md               # Docker configurations
│   ├── NGINX.md                # Nginx setup
│   └── SCRIPTS.md              # Infrastructure scripts
│
└── ARCHIVE/                     # Legacy documents (this folder)
    ├── README.md               # This file
    ├── root/                   # From project root
    └── docs/                   # From docs/ subfolders
```

---

## 📊 Archiving Statistics

| Category | Files Archived | Total Size | Reason |
|----------|---------------|------------|--------|
| Planning | 3 | ~1.8 MB | Consolidated into single document |
| Database | 1 | ~150 KB | Moved to DATABASE/ folder |
| Production | 2 | ~300 KB | Split into PRODUCTION/ subfolder |
| Deployment | 1 | ~500 KB | Moved to DEPLOYMENT/ folder |
| Operations | 1 | ~600 KB | Moved to OPERATIONS/ folder |
| **Total** | **8** | **~3.35 MB** | **Better organization** |

---

## 🚀 How to Find Documentation

### I need to...

**Deploy the application**
→ `docs/DEPLOYMENT/BACKEND.md`

**Prepare for production launch**
→ `docs/PRODUCTION/PLANNING.md`

**Monitor after launch**
→ `docs/OPERATIONS/MONITORING.md`

**Setup database**
→ `docs/DATABASE/INFRASTRUCTURE.md`

**Understand editorial workflow**
→ `docs/EDITORIAL/WORKFLOW.md`

**Configure infrastructure**
→ `docs/INFRASTRUCTURE/SCRIPTS.md`

**Find everything**
→ `docs/README.md` (central index)

---

## 🗑️ Future Cleanup

**Next cleanup scheduled:** June 14, 2026 (1 month after launch)

**Criteria for permanent deletion:**
- Files archived for >6 months with no access
- Documentation clearly outdated (old versions, deprecated features)
- No references in current documentation
- Team consensus to delete

**Deletion process:**
1. Mark for deletion in this README
2. Notify team 7 days prior
3. Create backup tarball: `tar -czf archive_backup_YYYYMMDD.tar.gz ARCHIVE/`
4. Delete files permanently
5. Update this README

---

## 📝 Change Log

| Date | Action | Files Affected |
|------|--------|----------------|
| 2026-05-14 | Initial archive creation | 8 files moved to ARCHIVE/ |
| | Created organized docs structure | +8 README files |
| | Consolidated production planning | 3 files → 1 PLANNING.md |

---

## ⚠️ Warning

**DO NOT EDIT FILES IN ARCHIVE/**

These files are read-only historical records. If you need to update documentation, edit the **current version** in the main `docs/` folders, not the archived versions.

---

**Purpose:** Preserve history, not serve current needs  
**Status:** Read-only archive  
**Maintained by:** BeritaKarya Engineering Team  
**Last Updated:** May 14, 2026