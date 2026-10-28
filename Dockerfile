# syntax=docker/dockerfile:1
# Cloudlane Homelab: build Vite em Node e entrega estática em nginx-unprivileged
# (porta 8080, usuário 101, raiz somente leitura no k3s com /tmp em memória).

# ---------- 1. Build ----------
FROM node:24.22.1-alpine3.24@sha256:06d7adf3e0ef61a13f1d28682726366f97a15aa1888c934d3ecec86c33918b53 AS build
WORKDIR /app
RUN chown node:node /app
USER node

COPY --chown=node:node package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY --chown=node:node . .
# tsc -b + vite build (gera __MEDIA_VERSION__ a partir do conteúdo de public/media)
RUN npm run build

# ---------- 2. Servidor estático ----------
FROM nginx/nginx-unprivileged:1.30.6-alpine@sha256:517607ae849a46afbd400616a783e4ead0290f52d20ccc0618ccea1a49362474 AS runtime
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY deploy/security-headers.conf /etc/nginx/conf.d/security-headers.inc
COPY --from=build /app/dist /usr/share/nginx/html

USER 101:101
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1:8080/healthz || exit 1

ENTRYPOINT ["nginx"]
CMD ["-g", "daemon off;"]
