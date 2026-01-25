FROM oven/bun:1.3.5

RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY . .
RUN bun install --frozen-lockfile
RUN chmod +x ./scripts/docker-entrypoint.sh

ENTRYPOINT ["./scripts/docker-entrypoint.sh"]

CMD ["bun", "run", "src/index.ts"]