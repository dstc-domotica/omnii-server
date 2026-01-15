FROM oven/bun:1.3.5 AS base

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production

FROM base AS runtime
COPY . .
ENV NODE_ENV=production
ENV DB_PATH=/data/omnii.db
VOLUME ["/data"]
EXPOSE 3001 50051
CMD ["bun", "run", "src/index.ts"]

FROM base AS migrate
COPY . .
ENV NODE_ENV=production
ENV DB_PATH=/data/omnii.db
VOLUME ["/data"]
CMD ["bun", "run", "db:migrate"]
