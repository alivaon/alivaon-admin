# Image du back-office (sortie « standalone »).
#   docker build -f docker/Dockerfile -t alivaon-admin .
ARG NODE_VERSION=24

FROM node:${NODE_VERSION}-alpine AS base
RUN corepack enable
WORKDIR /repo

# ── Dépendances (couche mise en cache tant que les manifestes ne changent pas)
FROM base AS deps
ARG APP=admin
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/${APP}/package.json apps/${APP}/
COPY packages/api-client/package.json packages/api-client/
RUN pnpm install --frozen-lockfile --filter "@alivaon/${APP}..."

# ── Build
FROM deps AS build
ARG APP=admin
COPY packages/api-client packages/api-client
COPY apps/${APP} apps/${APP}
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm --filter "@alivaon/${APP}" run build

# ── Exécution : uniquement le serveur standalone et ses fichiers statiques
FROM node:${NODE_VERSION}-alpine AS runtime
ARG APP=admin
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    APP=${APP}
WORKDIR /app
RUN addgroup -S nextjs && adduser -S nextjs -G nextjs
COPY --from=build --chown=nextjs:nextjs /repo/apps/${APP}/.next/standalone ./
COPY --from=build --chown=nextjs:nextjs /repo/apps/${APP}/.next/static ./apps/${APP}/.next/static
COPY --from=build --chown=nextjs:nextjs /repo/apps/${APP}/public ./apps/${APP}/public
USER nextjs
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/api/health >/dev/null || exit 1
CMD ["sh", "-c", "exec node apps/${APP}/server.js"]
