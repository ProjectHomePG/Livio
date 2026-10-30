#!/usr/bin/env bash
# Export the H2 database (backend/data/livio_db.mv.db) to CSVs for migration.
# Output: /tmp/h2export/*.csv (override with H2EXPORT_DIR)
set -euo pipefail

H2_JAR="${H2_JAR:-$HOME/.m2/repository/com/h2database/h2/2.2.224/h2-2.2.224.jar}"
SRC_DB="${1:-backend/data/livio_db.mv.db}"
OUT_DIR="${H2EXPORT_DIR:-/tmp/h2export}"

mkdir -p "$OUT_DIR"
WORK_DB="$OUT_DIR/livio_export.mv.db"
cp "$SRC_DB" "$WORK_DB"

TABLES=(AMENITIES USERS PGS IMAGES REVIEWS FAVORITES INQUIRIES PG_AMENITIES PG_NEARBY_PLACES)
SQL=""
for t in "${TABLES[@]}"; do
  lower=$(echo "$t" | tr '[:upper:]' '[:lower:]')
  SQL+="CALL CSVWRITE('$OUT_DIR/$lower.csv', 'SELECT * FROM $t', 'charset=UTF-8 null=@@NULL@@');"
done

java -cp "$H2_JAR" org.h2.tools.Shell \
  -url "jdbc:h2:$WORK_DB;IFEXISTS=TRUE;ACCESS_MODE_DATA=r" \
  -user sa -password "" \
  -sql "$SQL"

echo "Exported to $OUT_DIR:"
wc -l "$OUT_DIR"/*.csv
