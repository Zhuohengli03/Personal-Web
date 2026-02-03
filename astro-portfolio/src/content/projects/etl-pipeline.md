---
title: ETL Pipeline for Game Market Data
description: Automated ingestion, deduplication, and batch loading into PostgreSQL with scheduling and 24/7 updates.
pubDate: 2025-01-15
featured: true
tech: [Python, PostgreSQL, SQL, Bash, ETL]
repo: https://github.com/Zhuohengli03
---

## Overview

This project automates data ingestion and storage for computer game market data using **PostgreSQL**. It includes scraping, deduplication, batch inserts, and a resilient pipeline with scheduling and interruption control for 24/7 updates.

## Technical approach

- **Ingestion**: Python scripts fetch data from multiple sources; raw data is validated and normalized.
- **Deduplication**: Composite keys and `ON CONFLICT` (or equivalent) ensure no duplicate records.
- **Loading**: Batch inserts with connection pooling to keep throughput high.

Example pipeline step (conceptual):

```bash
# Run daily ingestion (cron or systemd timer)
./scripts/ingest.sh --source steam --since yesterday
```

```python
# Pseudocode: batch insert with conflict handling
def load_batch(rows: list[dict], table: str) -> int:
    with get_connection() as conn:
        return conn.execute(
            f"""
            INSERT INTO {table} (id, name, price, fetched_at)
            VALUES (%(id)s, %(name)s, %(price)s, %(fetched_at)s)
            ON CONFLICT (id) DO UPDATE SET
                name = EXCLUDED.name,
                price = EXCLUDED.price,
                fetched_at = EXCLUDED.fetched_at
            """,
            rows,
        ).rowcount
```

```sql
-- Example schema (simplified)
CREATE TABLE game_listings (
    id          TEXT PRIMARY KEY,
    name        TEXT NOT NULL,
    price       NUMERIC(10, 2),
    fetched_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_fetched_at ON game_listings (fetched_at);
```

## Outcomes

- Reliable 24/7 updates with retries and logging.
- Clear audit trail via `fetched_at` and optional version columns.
- Foundation for downstream forecasting and reporting.
