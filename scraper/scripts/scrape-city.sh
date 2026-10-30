#!/bin/bash

# Scrape PGs from Google Maps for a specific city
# Usage: ./scrape-city.sh <city> [--proxy <proxy_string>]
# Example: ./scrape-city.sh mumbai --proxy 'socks5://user:pass@host:port'
# Example: ./scrape-city.sh pune --proxy 'http://host2:port2,socks5://host3:port3'

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
QUERIES_DIR="$SCRIPT_DIR/../queries"
OUTPUT_DIR="$SCRIPT_DIR/../output"

# Parse args
CITY=""
PROXY=""
SKIP_IMAGES=""

while [[ $# -gt 0 ]]; do
    case "$1" in
        --proxy)
            PROXY="$2"
            shift 2
            ;;
        --no-images)
            SKIP_IMAGES="1"
            shift
            ;;
        *)
            if [ -z "$CITY" ]; then
                CITY="$1"
            else
                echo "Error: unexpected argument '$1'"
                echo "Usage: ./scrape-city.sh <city> [--proxy <proxy_string>] [--no-images]"
                exit 1
            fi
            shift
            ;;
    esac
done

if [ -z "$CITY" ]; then
    echo "Usage: ./scrape-city.sh <city> [--proxy <proxy_string>]"
    echo "  --proxy <proxy_string>  Comma-separated list of proxies (socks5://, http://, https://)"
    exit 1
fi

# Validate city file exists
if [ ! -f "$QUERIES_DIR/$CITY.txt" ]; then
    echo "Error: Query file not found: $QUERIES_DIR/$CITY.txt"
    echo "Available cities:"
    ls "$QUERIES_DIR"/*.txt 2>/dev/null | xargs -n1 basename | sed 's/.txt$//' || echo "  No query files found"
    exit 1
fi

# Create output directory if it doesn't exist
mkdir -p "$OUTPUT_DIR"

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
OUTPUT_FILE="$OUTPUT_DIR/${CITY}_${TIMESTAMP}.csv"

echo "=========================================="
echo "Scraping PGs for: $CITY"
[ -n "$PROXY" ] && echo "Proxy: $PROXY"
echo "Output file: $OUTPUT_FILE"
echo "=========================================="

# Build command args
DOCKER_ARGS=(
    --rm
    -v "$QUERIES_DIR/$CITY.txt:/queries.txt:ro"
    -v "$OUTPUT_DIR:/out"
    gosom/google-maps-scraper
    -input /queries.txt
    -results "/out/${CITY}_${TIMESTAMP}.csv"
    -depth 1
    -c 2
    -browser-pool-size 1
    -exit-on-inactivity 5m
)

# Add proxy flag if provided
if [ -n "$PROXY" ]; then
    DOCKER_ARGS+=(-proxies "$PROXY")
fi

docker run "${DOCKER_ARGS[@]}"

echo ""
echo "=========================================="
echo "Scraping complete!"
echo "Output: $OUTPUT_FILE"
echo "=========================================="

# Google removed the photo gallery from the place-page data blob, so the
# scraper's `images` column comes back empty. Recover the galleries from the
# rendered place pages with Playwright (skippable with --no-images).
if [ -z "$SKIP_IMAGES" ] && [ -f "$OUTPUT_FILE" ]; then
    if ! command -v node &> /dev/null; then
        echo "node not found - skipping photo fetch"
    elif [ ! -d "$SCRIPT_DIR/node_modules/playwright" ]; then
        echo "Playwright not installed - run 'cd scripts && npm install' to enable photo fetch"
    else
        echo ""
        echo "Fetching photo galleries (this visits each place page)..."
        node "$SCRIPT_DIR/fetch-images.mjs" "$OUTPUT_FILE" || echo "Photo fetch finished with errors (CSV kept as-is)"
    fi
fi

if command -v csvtool &> /dev/null; then
    echo "Rows extracted: $(csvtool -h "$OUTPUT_FILE" | wc -l)"
elif command -v wc &> /dev/null; then
    echo "Lines in CSV: $(wc -l < "$OUTPUT_FILE")"
fi
