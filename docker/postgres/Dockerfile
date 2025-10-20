# Custom Postgres image with pgvector installed
FROM postgres:16.4

RUN apt-get update \
    && apt-get install -y --no-install-recommends postgresql-16-pgvector \
    && rm -rf /var/lib/apt/lists/*

# Optional: document default port
EXPOSE 5432
