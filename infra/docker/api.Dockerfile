# Stage 1: Dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/types/package.json ./packages/types/
COPY packages/utils/package.json ./packages/utils/
COPY packages/config/package.json ./packages/config/

RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app

RUN npm install -g pnpm turbo
COPY . .
COPY --from=deps /app/node_modules ./node_modules
# Pastikan semua node_modules workspace ter-link dengan benar
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @beritakarya/api run db:generate
# Rebuild sharp untuk arsitektur alpine agar pemrosesan gambar lancar
RUN cd apps/api && npm rebuild sharp
RUN pnpm turbo run build --filter=@beritakarya/api --force

# Stage 3: Runner
FROM node:20-alpine AS runner
# [H-014] Ensure curl is installed for healthcheck
RUN apk add --no-cache openssl libc6-compat curl
# Instal pnpm di tahap runner agar semua perintah monorepo bisa dipanggil dengan benar
RUN npm install -g pnpm

WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser  --system --uid 1001 apiuser

# Hanya salin file yang diperlukan untuk menjalankan aplikasi (dist, node_modules, prisma)
# Ini mengurangi ukuran image secara signifikan (~300MB -> ~100MB)
COPY --from=builder --chown=apiuser:nodejs /app/node_modules /app/node_modules
COPY --from=builder --chown=apiuser:nodejs /app/packages /app/packages
COPY --from=builder --chown=apiuser:nodejs /app/apps/api/dist /app/apps/api/dist
COPY --from=builder --chown=apiuser:nodejs /app/apps/api/package.json /app/apps/api/package.json
COPY --from=builder --chown=apiuser:nodejs /app/apps/api/prisma /app/apps/api/prisma
COPY --from=builder --chown=apiuser:nodejs /app/apps/api/scripts /app/apps/api/scripts
COPY --from=builder --chown=apiuser:nodejs /app/apps/api/tsconfig.scripts.json /app/apps/api/tsconfig.scripts.json
COPY --from=builder --chown=apiuser:nodejs /app/package.json /app/package.json
COPY --from=builder --chown=apiuser:nodejs /app/pnpm-workspace.yaml /app/pnpm-workspace.yaml
COPY --from=builder --chown=apiuser:nodejs /app/apps/api/node_modules /app/apps/api/node_modules

# Berikan izin akses ke apiuser
# Pastikan folder uploads ada dan punya izin yang benar
RUN mkdir -p /app/apps/api/uploads/kyc && chown -R apiuser:nodejs /app/apps/api/uploads

USER apiuser
EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

# Jalankan dari folder apps/api menggunakan pnpm
WORKDIR /app/apps/api
CMD ["sh", "-c", "pnpm run db:migrate:deploy && node dist/apps/api/src/main.js"]
