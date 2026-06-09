#!/bin/bash
set -ex

# 1. Database Migration
pnpm --filter @workspace/db exec drizzle-kit push

# 2. Build Frontend
pnpm --filter @workspace/trip-portfolio run build

# 3. Build Backend
pnpm --filter @workspace/api-server run build

# 4. Prepare Vercel Output
mkdir -p vercel-dist
cp -R artifacts/trip-portfolio/dist/public/* vercel-dist/

echo "Build complete. Files in vercel-dist:"
ls -la vercel-dist
