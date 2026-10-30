# PG Data Scraper

Google Maps scraper for Livio PG Finder using [gosom/google-maps-scraper](https://github.com/gosom/google-maps-scraper).

## Prerequisites

- Docker installed and running
- No proxies needed (runs slowly but safely)

## Directory Structure

```
scraper/
├── docker-compose.yml      # Docker config
├── queries/                 # Search queries per city
│   ├── mumbai.txt
│   ├── bangalore.txt
│   ├── delhi.txt
│   └── pune.txt
├── output/                  # Scraped CSV files
└── scripts/
    ├── scrape-city.sh      # Batch scrape script
    └── fetch-images.mjs    # Photo-gallery recovery (Playwright)
```

## Usage

### One-time setup for photo fetching

Google no longer includes the photo gallery in the data the Docker scraper
reads, so `scrape-city.sh` runs `scripts/fetch-images.mjs` afterwards to
recover galleries from the rendered place pages. Enable it once:

```bash
cd scraper/scripts
npm install
npx playwright install chromium
```

### Scrape a single city

```bash
cd scraper
./scripts/scrape-city.sh mumbai
```

Pass `--no-images` to skip the photo-fetch step.

### Scrape all cities (one by one)

```bash
cd scraper
for city in mumbai bangalore delhi pune; do
    ./scripts/scrape-city.sh $city
    echo "Waiting 60 seconds before next city..."
    sleep 60
done
```

### Import scraped data to Supabase

The old Spring Boot import endpoints are gone — use the Supabase importer instead
(keeps the same heuristics: city-based price estimates, gender inference from
title, place-ID dedupe, Google-reviews import):

```bash
cd scripts/supabase

# Dry run: see what would be imported/updated
node --env-file=../../.env.migrate import-scraper.mjs ../../scraper/output --dry-run

# Import only NEW PGs (skip anything already in the DB — recommended)
node --env-file=../../.env.migrate import-scraper.mjs ../../scraper/output --new-only

# Import a single city file
node --env-file=../../.env.migrate import-scraper.mjs ../../scraper/output/noida_20261011_205637.csv --new-only
```

Notes:
- **Always use `--new-only`** for re-runs — without it, existing PGs are updated
  (prices/description reset from CSV).
- Flags: `--city <fallback>`, `--owner <email>`, `--status APPROVED|PENDING_VERIFICATION`,
  `--place-ids a,b,c` (targeted), `--limit <n>`, `--dry-run`.
- Images download straight into the Supabase `pg-images` bucket (public URLs).
- PGs land owned by `owner@example.com`; edit them later in the admin UI (`/admin`).


## CSV Output Format

The scraper outputs a 36-column CSV (gosom format). Common columns:

| Column | Description |
|--------|-------------|
| title | PG/Hostel name |
| address | Full address |
| phone | Phone number |
| website | Website URL |
| review_rating | Google rating (0-5) |
| review_count | Number of reviews |
| latitude / longitude | GPS coordinates |
| place_id | Google Place ID (used for deduplication) |
| thumbnail | Primary image URL |
| images | JSON array of `{"title","image"}` photo-gallery entries |
| open_hours | Operating hours |
| category | Business category |

### Backfilling photos on old CSVs

CSVs scraped while the gallery was broken can be repaired in place:

```bash
cd scraper/scripts
node fetch-images.mjs ../output/<city>_<timestamp>.csv
```

## Rate Limiting

Without proxies, the scraper may get blocked after ~100-300 results. To avoid this:

- Run one city at a time
- Wait 5-10 minutes between cities
- Keep concurrency low (`-c 2`)
- Use browser pool size 1 (`-browser-pool-size 1`)

## Adding New Cities

1. Create a new file in `queries/` named `<city>.txt`
2. Add search queries (one per line):
   ```
   PG in <City>
   Paying Guest in <City>
   Boys Hostel in <City>
   Girls Hostel in <City>
   ```
3. Run: `./scripts/scrape-city.sh <city>`

## Troubleshooting

### Docker not found
Install Docker: https://docs.docker.com/get-docker/

### Scraper stops early
This is normal without proxies. The scraper will output what it can before being rate-limited.

### CSV file is empty
Check if the query file exists and has valid search terms.
