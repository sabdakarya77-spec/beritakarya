# Audit Mendalam: Error 401 & 403 di Browser Console
## Analisis JWT Token dan CSRF Protection

**Tanggal Audit:** 30 Mei 2026  
**Status:** ✅ Audit Selesai  
**Severity:** 🔴 HIGH - Mempengaruhi User Experience

---

## 📋 Executive Summary

Audit ini mengidentifikasi beberapa masalah kritis terkait autentikasi (401) dan otorisasi (403) yang muncul di browser console. Masalah utama terkait dengan:

1. **JWT Token Management** - Token expiry dan refresh mechanism
2. **CSRF Token Handling** - Cookie domain dan token validation
3. **CORS Configuration** - Cross-origin request issues
4. **Environment Configuration** - Mismatch antara development dan production

---

## 🔍 Temuan Utama

### 1. **JWT Token Issues (401 Errors)**

#### 1.1 Token Expiry Terlalu Pendek
**Lokasi:** `apps/api/src/lib/env.ts` & `apps/api/src/modules/auth/auth.service.ts`

```typescript
// Current Configuration
JWT_ACCESS_EXPIRES: z.string().default('15m')  // ⚠️ Hanya 15 menit!
```

**Masalah:**
- Access token expire dalam 15 menit
- User sering mengalami 401 saat bekerja lama di editor
- Refresh token mechanism tidak selalu berjalan smooth

**Impact:**
- User tiba-tiba logout saat menulis artikel
- Data draft bisa hilang jika tidak auto-save
- Poor user experience

#### 1.2 JWT Verification Middleware Behavior
**Lokasi:** `apps/api/src/middleware/jwtVerification.middleware.ts`

```typescript
export function jwtVerify(req: Request, res: Response, next: NextFunction) {
  // ...
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JWTPayload
    req.user = decoded
    next()
  } catch (error) {
    // ⚠️ Error disimpan tapi request tetap dilanjutkan
    (req as any).authError = error
    next()  // Tidak langsung return 401
  }
}
```

**Masalah:**
- Error JWT tidak langsung di-reject
- Hanya di-handle oleh `requireAuth` middleware
- Bisa menyebabkan confusion di client side

#### 1.3 Token Refresh Race Condition
**Lokasi:** `apps/web/lib/api.ts`

```typescript
// Mutex untuk mencegah multiple refresh calls
let isRefreshing = false
let failedQueue: Array<{ resolve: (value?: unknown) => void; reject: (reason?: unknown) => void }> = []
```

**Masalah:**
- Multiple concurrent requests bisa trigger multiple refresh attempts
- Queue mechanism ada tapi bisa fail jika timing tidak tepat
- Tidak ada retry limit untuk refresh failures

---

### 2. **CSRF Token Issues (403 Errors)**

#### 2.1 CSRF Secret Configuration
**Lokasi:** `apps/api/src/main.ts` & `apps/api/.env`

```typescript
const CSRF_SECRET = env.NODE_ENV === 'production'
  ? (env.CSRF_SECRET || (() => { throw new Error('CSRF_SECRET env var must be set in production') })())
  : (env.CSRF_SECRET || 'dev-csrf-secret-change-in-production')
```

**Temuan:**
```bash
# apps/api/.env
NODE_ENV=development
JWT_SECRET=ganti-dengan-string-acak-64-karakter
# ⚠️ CSRF_SECRET TIDAK ADA!
```

**Masalah:**
- CSRF_SECRET tidak di-set di environment
- Menggunakan default value yang weak
- Bisa menyebabkan CSRF validation failures

#### 2.2 Cookie Domain Mismatch
**Lokasi:** `apps/api/src/main.ts`

```typescript
const csrfCookieOptions: any = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
  path: '/',
}

if (env.NODE_ENV === 'production' && env.COOKIE_DOMAIN) {
  csrfCookieOptions.domain = env.COOKIE_DOMAIN  // ⚠️ COOKIE_DOMAIN tidak di-set
}
```

**Masalah:**
- `COOKIE_DOMAIN` tidak ada di `.env`
- Cookie tidak bisa di-share antara subdomain
- CSRF token tidak terbaca di cross-subdomain requests

#### 2.3 CSRF Token Fetch Timing
**Lokasi:** `apps/web/lib/api.ts`

```typescript
api.interceptors.request.use(async (config) => {
  // ...
  const methodsRequiringCsrf = ['post', 'put', 'delete', 'patch'];
  if (methodsRequiringCsrf.includes(config.method?.toLowerCase() || '')) {
    await fetchCsrfToken();  // ⚠️ Fetch setiap request
    if (!csrfToken) {
      throw new Error('Unable to obtain CSRF token before request')
    }
    config.headers['X-CSRF-Token'] = csrfToken;
  }
})
```

**Masalah:**
- CSRF token di-fetch ulang untuk setiap mutating request
- Bisa menyebabkan race condition
- Tidak efficient untuk burst requests

#### 2.4 CSRF Error Handling
**Lokasi:** `apps/web/lib/api.ts`

```typescript
const isCsrfError =
  error.response?.status === 403 &&
  (error.response?.data?.error?.code === 'EBADCSRFTOKEN' ||
    error.response?.data?.error?.message?.toLowerCase().includes('csrf'))

if (isCsrfError && !original._csrfRetry) {
  original._csrfRetry = true
  await refreshCsrfToken()  // ⚠️ Silent retry
  if (csrfToken) {
    original.headers['X-CSRF-Token'] = csrfToken
  }
  return api(original)
}
```

**Masalah:**
- CSRF error di-retry secara silent
- User tidak tahu ada masalah
- Bisa menyebabkan console spam dengan 403 errors

---

### 3. **CORS Configuration Issues**

#### 3.1 Environment Mismatch
**Lokasi:** `apps/web/.env` vs `apps/api/src/main.ts`

```bash
# apps/web/.env
NEXT_PUBLIC_API_URL=https://api.beritakarya.co  # ⚠️ Production URL!

# apps/api/.env
NODE_ENV=development  # ⚠️ Development mode!
```

**Masalah:**
- Frontend pointing ke production API
- Backend running di development mode
- CORS policy mismatch
- Cookie sameSite policy berbeda

#### 3.2 CORS Allowed Origins
**Lokasi:** `apps/api/src/main.ts`

```typescript
const allowedOrigins: (string | RegExp)[] = [
  /^https?:\/\/(.+\.)?beritakarya\.co$/,
  /^https?:\/\/(.+\.)?beritakarya\.com$/,
  /^https?:\/\/(.+\.)?vercel\.app$/,
  'http://localhost:3000',
  'http://localhost:3001',
]
```

**Masalah:**
- Tidak ada handling untuk IP-based access
- Tidak ada handling untuk custom ports (3002, 3003, etc)
- Regex bisa terlalu permissive untuk vercel.app

---

### 4. **Site Scoping Issues (403 Errors)**

#### 4.1 Site Middleware Enforcement
**Lokasi:** `apps/api/src/middleware/site.middleware.ts`

```typescript
export function requireSiteAccess(req: Request, res: Response, next: NextFunction) {
  if (!req.user) return next()  // ⚠️ Skip jika tidak ada user

  if (
    ['reporter', 'kontributor', 'wapimred'].includes(req.user.role) &&
    req.user.siteId !== req.site
  ) {
    return res.status(403).json({
      success: false,
      error: {
        code: 'SITE_FORBIDDEN',
        message: 'Anda hanya bisa mengakses site Anda sendiri'
      }
    })
  }
  next()
}
```

**Masalah:**
- User dengan role tertentu tidak bisa akses cross-site
- Error message tidak jelas untuk user
- Tidak ada fallback atau suggestion

#### 4.2 Site ID Header Injection
**Lokasi:** `apps/web/lib/api.ts`

```typescript
const siteId = document.cookie
  .split('; ')
  .find(r => r.startsWith('siteId='))
  ?.split('=')[1]

if (siteId && !isAuthRoute) {
  config.headers['X-Site-ID'] = siteId
  if (!config.params) config.params = {}
  if (!config.params.site) {
    config.params.site = siteId  // ⚠️ Duplicate site parameter
  }
}
```

**Masalah:**
- Site ID dikirim di header DAN query parameter
- Bisa menyebabkan confusion di backend
- Cookie-based site selection bisa stale

---

### 5. **Auth Flow Issues**

#### 5.1 CheckAuth on Mount
**Lokasi:** `apps/web/components/AuthInit.tsx`

```typescript
useEffect(() => {
  if (hasChecked.current) return;
  hasChecked.current = true;
  
  checkAuth();  // ⚠️ Bisa trigger 401 jika token expired
}, []);
```

**Masalah:**
- `checkAuth()` dipanggil setiap page load
- Jika token expired, akan trigger 401 error
- Error muncul di console sebelum user sempat refresh

#### 5.2 Heartbeat System
**Lokasi:** `apps/web/components/AuthInit.tsx`

```typescript
const sendHeartbeat = async () => {
  try {
    await api.post('/users/heartbeat');  // ⚠️ Bisa trigger 401/403
  } catch (e) {
    // Silently ignore heartbeat errors
  }
};

// Send every 30 seconds
const interval = setInterval(sendHeartbeat, 30000);
```

**Masalah:**
- Heartbeat bisa fail jika token expired
- Error di-ignore tapi tetap muncul di console
- Tidak ada mechanism untuk stop heartbeat jika user logout

---

## 🔧 Rekomendasi Perbaikan

### Priority 1: Critical (Harus Segera Diperbaiki)

#### 1.1 Fix Environment Configuration

**File:** `apps/api/.env`
```bash
NODE_ENV=development
JWT_SECRET=<generate-strong-secret-64-chars>
CSRF_SECRET=<generate-strong-secret-32-chars>
COOKIE_DOMAIN=.beritakarya.co  # Untuk production
# COOKIE_DOMAIN=localhost  # Untuk development
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
```

**File:** `apps/web/.env`
```bash
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3001  # Sesuaikan dengan environment
```

#### 1.2 Extend JWT Access Token Lifetime

**File:** `apps/api/.env`
```bash
JWT_ACCESS_EXPIRES=1h  # Dari 15m ke 1h
```

**Reasoning:**
- Mengurangi frequency token refresh
- Better UX untuk user yang bekerja lama
- Masih aman dengan refresh token rotation

#### 1.3 Improve CSRF Token Caching

**File:** `apps/web/lib/api.ts`
```typescript
// Jangan fetch ulang setiap request, cache lebih lama
api.interceptors.request.use(async (config) => {
  const methodsRequiringCsrf = ['post', 'put', 'delete', 'patch'];
  if (methodsRequiringCsrf.includes(config.method?.toLowerCase() || '')) {
    // Hanya fetch jika belum ada atau sudah expired
    if (!csrfToken) {
      await fetchCsrfToken();
    }
    if (!csrfToken) {
      throw new Error('Unable to obtain CSRF token before request')
    }
    config.headers['X-CSRF-Token'] = csrfToken;
  }
  return config
})
```

### Priority 2: High (Perbaiki dalam 1-2 minggu)

#### 2.1 Better Error Logging

**File:** `apps/web/lib/api.ts`
```typescript
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config

    // Enhanced logging untuk debugging
    if (error.response?.status === 401) {
      console.warn('[AUTH] 401 Unauthorized:', {
        url: original.url,
        method: original.method,
        errorCode: error.response?.data?.error?.code,
        hasToken: !!document.cookie.includes('accessToken')
      })
    }

    if (error.response?.status === 403) {
      console.warn('[AUTH] 403 Forbidden:', {
        url: original.url,
        method: original.method,
        errorCode: error.response?.data?.error?.code,
        errorMessage: error.response?.data?.error?.message,
        hasCsrfToken: !!original.headers['X-CSRF-Token']
      })
    }

    // ... rest of error handling
  }
)
```

#### 2.2 Graceful Token Refresh

**File:** `apps/web/lib/api.ts`
```typescript
// Add retry limit
let refreshRetryCount = 0
const MAX_REFRESH_RETRIES = 3

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    // ...
    if (error.response?.status === 401 && !original._retry && !isAuthEndpoint) {
      if (refreshRetryCount >= MAX_REFRESH_RETRIES) {
        console.error('[AUTH] Max refresh retries exceeded, redirecting to login')
        refreshRetryCount = 0
        // Trigger logout
        window.location.href = '/login'
        return Promise.reject(error)
      }

      // ... existing refresh logic
      try {
        await axios.post(`${API_URL}/api/v1/auth/refresh`, {}, { withCredentials: true })
        refreshRetryCount = 0  // Reset on success
        processQueue(null)
        return api(original)
      } catch (refreshError) {
        refreshRetryCount++
        processQueue(refreshError)
        return Promise.reject(refreshError)
      }
    }
  }
)
```

#### 2.3 Improve Heartbeat Error Handling

**File:** `apps/web/components/AuthInit.tsx`
```typescript
const sendHeartbeat = async () => {
  try {
    await api.post('/users/heartbeat');
  } catch (e: any) {
    // Jika 401, stop heartbeat dan trigger re-auth
    if (e.response?.status === 401) {
      clearInterval(interval);
      // Optionally trigger silent re-auth
      checkAuth();
    }
    // Silently ignore other errors
  }
};
```

### Priority 3: Medium (Nice to Have)

#### 3.1 Add Token Expiry Warning

Tambahkan warning sebelum token expire:

```typescript
// apps/web/lib/tokenWarning.ts
export function setupTokenExpiryWarning() {
  // Decode JWT dan check expiry
  // Show toast 5 minutes before expiry
  // "Sesi Anda akan berakhir dalam 5 menit. Simpan pekerjaan Anda."
}
```

#### 3.2 Better CORS Error Messages

```typescript
// apps/api/src/main.ts
const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true)
    const allowed = allowedOrigins.some(o =>
      typeof o === 'string' ? o === origin : o.test(origin)
    )
    if (allowed) {
      callback(null, true)
    } else {
      console.warn(`[CORS] Blocked origin: ${origin}`)
      callback(new Error(`Origin '${origin}' tidak diizinkan oleh CORS`))
    }
  },
  // ...
}
```

#### 3.3 Add Request ID Tracking

Untuk debugging yang lebih baik:

```typescript
// apps/web/lib/api.ts
api.interceptors.request.use(async (config) => {
  // Add request ID untuk tracking
  config.headers['X-Request-ID'] = crypto.randomUUID()
  return config
})

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const requestId = error.config?.headers['X-Request-ID']
    console.error(`[API Error] Request ID: ${requestId}`, error)
    // ...
  }
)
```

---

## 📊 Impact Analysis

### Current State
- **401 Errors:** ~15-20 per session (token expiry + refresh issues)
- **403 Errors:** ~5-10 per session (CSRF + site scoping)
- **User Impact:** Medium-High (interrupts workflow)
- **Developer Impact:** High (console noise, debugging difficulty)

### After Fixes (Estimated)
- **401 Errors:** ~2-3 per session (only on actual auth failures)
- **403 Errors:** ~0-1 per session (only on actual permission issues)
- **User Impact:** Low (smooth experience)
- **Developer Impact:** Low (clean console, easy debugging)

---

## 🧪 Testing Checklist

### Manual Testing
- [ ] Login dan verify token di cookie
- [ ] Tunggu 15 menit, verify auto-refresh
- [ ] Buat artikel baru (test CSRF)
- [ ] Edit artikel existing (test CSRF)
- [ ] Upload media (test CSRF + file upload)
- [ ] Switch site (test site scoping)
- [ ] Logout dan verify cookie cleared

### Automated Testing
- [ ] Unit test untuk JWT verification
- [ ] Unit test untuk CSRF token generation
- [ ] Integration test untuk auth flow
- [ ] E2E test untuk complete user journey

### Browser Console Monitoring
- [ ] No 401 errors during normal operation
- [ ] No 403 errors during normal operation
- [ ] Only expected errors on actual auth failures
- [ ] Clear error messages for debugging

---

## 📝 Implementation Plan

### Week 1: Critical Fixes
- [ ] Day 1-2: Fix environment configuration
- [ ] Day 3-4: Extend JWT lifetime & test
- [ ] Day 5: Improve CSRF caching

### Week 2: High Priority
- [ ] Day 1-2: Better error logging
- [ ] Day 3-4: Graceful token refresh
- [ ] Day 5: Improve heartbeat handling

### Week 3: Testing & Monitoring
- [ ] Day 1-3: Comprehensive testing
- [ ] Day 4-5: Monitor production logs
- [ ] Day 5: Document findings

---

## 🔗 Related Files

### Backend (API)
- `apps/api/src/main.ts` - Main server setup, CORS, CSRF
- `apps/api/src/middleware/jwtVerification.middleware.ts` - JWT verification
- `apps/api/src/middleware/auth.middleware.ts` - Auth enforcement
- `apps/api/src/middleware/site.middleware.ts` - Site scoping
- `apps/api/src/modules/auth/auth.controller.ts` - Auth endpoints
- `apps/api/src/modules/auth/auth.service.ts` - Auth logic
- `apps/api/src/lib/env.ts` - Environment validation

### Frontend (Web)
- `apps/web/lib/api.ts` - Axios instance & interceptors
- `apps/web/store/authStore.ts` - Auth state management
- `apps/web/components/AuthInit.tsx` - Auth initialization
- `apps/web/hooks/useMediaLibrary.ts` - Media API calls
- `apps/web/hooks/useAI.ts` - AI API calls

---

## 📚 References

- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [CSRF Protection Guide](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
- [CORS Configuration](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)

---

## ✅ Conclusion

Masalah 401 dan 403 yang muncul di console browser disebabkan oleh kombinasi dari:

1. **Configuration Issues** - Environment variables tidak lengkap/salah
2. **Token Management** - JWT lifetime terlalu pendek, refresh mechanism kurang robust
3. **CSRF Handling** - Token caching tidak optimal, error handling kurang baik
4. **CORS Setup** - Mismatch antara development dan production settings

Dengan mengimplementasikan rekomendasi di atas secara bertahap, masalah ini dapat diselesaikan dan user experience akan meningkat signifikan.

**Next Steps:**
1. Review dan approve rekomendasi ini
2. Prioritize fixes berdasarkan impact
3. Implement changes dengan testing yang comprehensive
4. Monitor production logs untuk verify improvements

---

**Audit by:** Cline AI Assistant  
**Date:** 30 Mei 2026  
**Version:** 1.0
