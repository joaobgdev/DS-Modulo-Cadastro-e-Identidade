FROM node:24-alpine AS base
RUN apk add --no-cache openssl libc6-compat
RUN corepack enable && corepack prepare pnpm@9.12.3 --activate
WORKDIR /app

FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/api/package.json ./apps/api/
COPY apps/api/prisma ./apps/api/prisma
RUN pnpm install --frozen-lockfile --filter ./apps/api...

FROM deps AS build
COPY apps/api ./apps/api
RUN pnpm --filter ./apps/api exec prisma generate
RUN pnpm --filter ./apps/api build

FROM base AS runner
ENV NODE_ENV=production
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=build /app/apps/api/dist ./apps/api/dist
COPY --from=build /app/apps/api/prisma ./apps/api/prisma
COPY --from=build /app/apps/api/package.json ./apps/api/package.json

EXPOSE 3000
CMD ["sh", "-c", "pnpm --filter ./apps/api exec prisma migrate deploy && pnpm --filter ./apps/api start"]