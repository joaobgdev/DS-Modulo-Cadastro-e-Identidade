FROM node:24-alpine AS build
RUN apk add --no-cache libc6-compat
RUN corepack enable
WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/web/package.json ./apps/web/
RUN pnpm install --frozen-lockfile --filter ./apps/web... --ignore-scripts && pnpm --filter ./apps/web... rebuild

COPY apps/web ./apps/web
RUN pnpm --filter ./apps/web build

FROM nginx:1.27-alpine AS runner
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/web/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]