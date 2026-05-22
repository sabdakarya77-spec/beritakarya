# CORS & CSRF Error Investigation Plan

## Problem
After deployment, the frontend at `https://beritakarya.co` cannot access the API at `https://api.beritakarya.co` due to CORS restrictions. Additionally, CSRF token fetch fails with 502 Bad Gateway.

## Errors Reported
1. `Access to XMLHttpRequest at 'https://api.beritakarya.co/api/v1/csrf-token' from origin 'https://beritakarya.co' has been blocked by CORS policy`
2. `Failed to fetch CSRF token AxiosError: Network Error`
3. `GET https://api.beritakarya.co/api/v1/csrf-token net::ERR_FAILED 502 (Bad Gateway)`

## Investigation Checklist

### Phase 1: Verify API Server Status
- [ ] Check if API server is running and accessible
- [ ] Test API endpoint directly (curl/postman)
- [ ] Check API server logs for errors
- [ ] Verify domain DNS resolution

### Phase 2: Check CORS Configuration
- [ ] Find CORS middleware in codebase
- [ ] Verify allowed origins include `https://beritakarya.co`
- [ ] Check CORS headers are set correctly
- [ ] Verify CORS applies to all routes (including /csrf-token)

### Phase 3: Check CSRF Configuration
- [ ] Locate CSRF middleware/implementation
- [ ] Verify CSRF token endpoint is working
- [ ] Check CSRF secret configuration
- [ ] Verify cookie settings (secure, sameSite, domain)

### Phase 4: Check Frontend API Configuration
- [ ] Verify NEXT_PUBLIC_API_URL in frontend .env
- [ ] Check that API base URL is correct
- [ ] Verify frontend is sending credentials properly

### Phase 5: Infrastructure/Proxy Issues
- [ ] Check nginx configuration (if used)
- [ ] Check load balancer/SSL termination
- [ ] Verify proxy headers (X-Forwarded-*)
- [ ] Check firewall/security groups

### Phase 6: Common Pitfalls
- [ ] HTTPS vs HTTP mismatch
- [ ] Domain wildcard vs exact match in CORS
- [ ] Missing Access-Control-Allow-Credentials header
- [ ] CSRF cookie not being set due to domain/path mismatch

## Files to Investigate
- `apps/api/src/middleware/` (CORS, CSRF)
- `apps/api/src/app.ts` or `apps/api/src/main.ts` (middleware setup)
- `apps/web/lib/api.ts` (frontend API client configuration)
- `infra/nginx/` or Docker configurations
- Environment files (.env.production, .env)
- `apps/api/src/lib/csrf.ts` or similar

## Expected Fixes
Based on common patterns:
1. Update CORS allowed origins to include production domain
2. Ensure CSRF token endpoint is publicly accessible (no auth required)
3. Set proper cookie domain and SameSite=None; Secure for cross-site
4. Configure frontend to send credentials: `withCredentials: true`
5. Add proper CORS headers: Access-Control-Allow-Origin, Access-Control-Allow-Credentials, Access-Control-Allow-Methods, Access-Control-Allow-Headers