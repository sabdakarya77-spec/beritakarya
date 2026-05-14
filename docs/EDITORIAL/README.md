# 📝 Editorial Workflow Documentation

**Last Updated:** May 14, 2026  
**Audience:** Editors, Journalists, Content Managers  
**Related:** AI Assistant Features, Editorial Tools

---

## 📋 What's Inside

This folder contains documentation for editorial workflows and content management:

| Document | Purpose | Audience |
|----------|---------|----------|
| **`WORKFLOW.md`** | Editorial workflow from pitch to publish | Editors, Journalists |
| **`AI_GUIDELINES.md`** | (Coming soon) AI-assisted content guidelines | All content creators |
| **`STYLE_GUIDE.md`** | (Coming soon) BeritaKarya style guide | Writers, Editors |

---

## 🎯 Quick Navigation

### Understanding Editorial Process
→ Start with **[WORKFLOW.md](./WORKFLOW.md)**

Contains:
- End-to-end editorial workflow
- Role definitions (Reporter, Editor, Managing Editor)
- Article lifecycle stages
- KYC requirements
- Publication approval process

**Read time:** 10-15 minutes

---

### Using AI Assistant
→ Check **`AI_GUIDELINES.md`** (coming soon)

Will cover:
- When to use AI features
- Content guidelines for AI-assisted writing
- Fact-checking requirements
- Attribution policies

---

## 📊 Editorial Workflow Overview

```
┌─────────────┐
│    Pitch    │ ← Reporter creates idea
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Draft     │ ← Reporter writes with AI assistance
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Submit     │ ← Reporter submits to editor
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Review     │ ← Editor reviews, suggests changes
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Revise     │ ← Reporter revises based on feedback
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Approve    │ ← Editor approves for publication
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Publish    │ ← Auto-scheduled or immediate
└─────────────┘
```

---

## 🤖 AI Features in Editorial Workflow

### Available AI Tools

| Feature | Purpose | When to Use |
|---------|---------|-------------|
| **Rewrite** | Rephrase entire paragraph | Need different tone/length |
| **Expand** | Add more detail | Short paragraph needs development |
| **Headline Generator** | Generate 5 title options | Every article needs headline |
| **SEO Generator** | Meta title, description, keywords | Before publishing |
| **Grammar Check** | Fix grammar/spelling | Final review before submit |
| **Readability** | Analyze reading level | Ensure accessibility |
| **Layout Analysis** | Suggest structure improvements | Complex articles |
| **Image Caption** | Generate captions from image URL | Photo uploads |

**Access:** AISidebar in editor (right panel)

---

## 🔐 KYC Requirements

### For Reporters (First-time Setup)

1. **Identity Verification**
   - Government ID (KTP/Passport)
   - Selfie with ID
   - Upload via `/kyc/submit`

2. **Editorial Agreement**
   - Sign digital contract
   - Agree to style guide
   - Confirm AI usage policy

3. **Approval Process**
   - Admin reviews KYC documents
   - 24-48 hours processing
   - Email notification upon approval

**Status:** Check `User.kycStatus` in admin panel

---

## 📋 Role-Based Permissions

| Role | Permissions | AI Access |
|------|-------------|-----------|
| **superadmin** | All features, user management | Unlimited |
| **wapimred** | Editorial oversight, site settings | 500/day |
| **editor** | Review, edit, publish articles | 200/day |
| **reporter** | Create & edit own articles | 100/day (GPT-3.5 only) |
| **reader** | Read published articles | No AI access |

**Note:** Reporter cannot use Headline/SEO/Layout (editorial decisions)

---

## ⚖️ Publishing Guidelines

### Before Publication

1. **AI Content Check**
   - [ ] Fact-check all AI-generated content
   - [ ] Verify names, dates, numbers
   - [ ] Ensure no fabricated quotes
   - [ ] Maintain journalistic integrity

2. **SEO Optimization**
   - [ ] Meta title < 60 chars
   - [ ] Meta description < 160 chars
   - [ ] Include target keywords
   - [ ] Add featured image with alt text

3. **Quality Assurance**
   - [ ] No placeholders (TODO, FIXME)
   - [ ] All images have captions
   - [ ] Categories & tags assigned
   - [ ] Author bio updated

---

## 🎨 Style Guide Highlights

### Writing Style

**Voice:**
- Professional but accessible
- Indonesian formal with local context
- Avoid jargon, explain technical terms
- Use active voice

**Tone:**
- Objective and neutral
- Fact-based, not opinionated (except op-ed)
- Respectful of all subjects
- Avoid sensationalism

**Structure:**
- Inverted pyramid (most important first)
- Short paragraphs (2-3 sentences)
- Subheadings every 300-500 words
- Bullet points for lists

---

### Headline Guidelines

**Do:**
- ✅ Clear and concise (< 60 chars)
- ✅ Include key information
- ✅ Use active voice
- ✅ Match article tone

**Don't:**
- ❌ Clickbait (must accurately reflect content)
- ❌ All caps
- ❌ Multiple punctuation (!?!)
- ❌ Vague promises

**AI Headline Generator:**
- Provide context paragraph
- Select tone: breaking news, feature, analysis
- Review suggestions carefully
- Edit generated headlines

---

## 🔍 Quality Control

### Editor Review Checklist

**Content:**
- [ ] Accurate facts verified
- [ ] Sources cited or attributed
- [ ] No plagiarism (run plagiarism checker)
- [ ] Balanced perspective

**Technical:**
- [ ] No spelling/grammar errors
- [ ] Readability score appropriate
- [ ] SEO meta filled
- [ ] Images optimized (size < 500KB)
- [ ] All links working

**Compliance:**
- [ ] No copyrighted material without permission
- [ ] No defamatory content
- [ ] KYC compliance (reporter's work)
- [ ] Editorial policy followed

---

## 📊 Editorial Metrics

Track these KPIs:

| Metric | Target | Measurement |
|--------|--------|-------------|
| Time to Publish | < 4 hours (from draft) | Workflow timestamps |
| AI Usage Rate | >60% of articles use AI | AIUsage table |
| Editor Approval Rate | >80% first submission | Workflow stats |
| Reader Engagement | >3 min avg read time | PageView analytics |
| SEO Score | >80/100 (Yoast equivalent) | SEO analyzer |

---

## 🆘 Common Issues

### AI Features Not Working

**Symptoms:** "AI features unavailable" or "quota exceeded"

**Check:**
1. User role & quota: `SELECT * FROM RoleQuota WHERE role = 'reporter'`
2. AIEnabled flag: `User.aiEnabled`
3. Redis quota counters: `redis-cli KEYS "ai:quota:*"`
4. Circuit breaker status: Check logs for OpenAI failures

**Fix:**
- Increase quota for user (if needed)
- Enable AI for user (admin panel)
- Check OpenAI API key validity
- Reset Redis counters if stuck

---

### Article Stuck in "Review"

**Cause:** Editor hasn't reviewed yet

**Solution:**
- Editor: Check `/editor/pending` queue
- Reporter: Send reminder via notification system
- Admin: Force reassign if editor unavailable

---

### Cannot Publish Article

**Common reasons:**
- ❌ KYC not approved yet
- ❌ Missing required fields (title, content, category)
- ❌ User not in "editor" or higher role
- ❌ AI quota exceeded (if using AI features during publish)

**Fix:**
1. Check KYC status in admin
2. Complete all required form fields
3. Verify user role permissions
4. Check AIUsage for quota limits

---

## 🔗 Related Documentation

| Topic | Document |
|-------|----------|
| **AI Assistant features** | `../PRODUCTION/PLANNING.md` (AI section) |
| **Deployment** | `../DEPLOYMENT/BACKEND.md` |
| **Monitoring** | `../OPERATIONS/MONITORING.md` |
| **Database schema** | `../DATABASE/INFRASTRUCTURE.md` |

---

## 📞 Support

### Editorial Questions
- **Editor-in-Chief:** editor@beritakarya.co
- **Tech Support:** tech@beritakarya.co (AI features)

### Training Resources
- Video tutorials (coming soon)
- Sample articles with best practices
- AI feature demo sessions (bi-weekly)

---

## 📝 Feedback

Found an issue or have a suggestion?

1. Create GitHub issue with `[Editorial]` prefix
2. Describe workflow problem
3. Suggest improvement
4. Tag: @editorial-team

---

**Remember:** AI assists, but journalists decide. Always fact-check AI output before publishing.

---

*"Great journalism with AI assistance, not AI replacement."*

**Maintained by:** BeritaKarya Editorial + Engineering Teams  
**Last Updated:** May 14, 2026  
**Next Review:** June 14, 2026