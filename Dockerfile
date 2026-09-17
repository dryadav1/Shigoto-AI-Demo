# ---- build frontend ----
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---- production runtime (API + static frontend, SQLite persists on /data) ----
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production PORT=4000 DB_DIR=/data
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
COPY server ./server
VOLUME ["/data"]
EXPOSE 4000
CMD ["node", "server/index.js"]
