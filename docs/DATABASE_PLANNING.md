# Livio (PG Near Me) — Database Architecture & Planning Guide

> **Purpose:** This document serves as the comprehensive architectural reference and operational manual for the Livio database ecosystem. It details the underlying relational schema, data dictionary, entity lifecycles, Row-Level Security (RLS) policies, storage pipeline, scraping/seeding workflows, and production deployment configuration.

---

## 1. Executive Summary & Architectural Overview

Livio has evolved from a traditional monolith (Spring Boot + embedded H2 SQL) to a modern, decoupled **Cloud PostgreSQL architecture hosted on Supabase**, integrated directly with Next.js 16 (Turbopack) through Supabase SSR and Client SDKs.

```mermaid
flowchart TD
    subgraph Client["Frontend Client (Next.js 16)"]
        Browser["User Browser / Mobile PWA"]
        SSR["Next.js Server (Edge & Node Workers)"]
    end

    subgraph Security["Security & Access Layer"]
        RLS["PostgreSQL Row-Level Security (RLS)"]
        AuthService["Supabase Auth (GoTrue JWT)"]
    end

    subgraph Database["Supabase Managed PostgreSQL"]
        Profiles["public.profiles"]
        PGs["public.pgs (Stays & Coliving)"]
        Images["public.images"]
        Amenities["public.amenities & pg_amenities"]
        Nearby["public.pg_nearby_places"]
        Reviews["public.reviews"]
        Favorites["public.favorites"]
        Inquiries["public.inquiries"]
    end

    subgraph StorageEngine["Supabase Storage (S3-Compatible)"]
        Bucket["storage.buckets ('pg-images')"]
    end

    Browser -->|Anon Key + JWT Cookie| AuthService
    Browser -->|Realtime / REST Read| RLS
    SSR -->|Server Session / SSR Cookie| RLS
    RLS --> Profiles
    RLS --> Pgs
    RLS --> Images
    RLS --> Amenities
    RLS --> Nearby
    RLS --> Reviews
    RLS --> Favorites
    RLS --> Inquiries
    Images -.->|Media CDN URLs| Bucket
```

### Key Architectural Pillars
1. **Serverless & Distributed Scaling:** Database connections are pooled via Supavisor / PgBouncer, supporting tens of thousands of concurrent guest browsing sessions without exhaustion.
2. **Declarative Security with RLS:** Security rules execute inside PostgreSQL at the row level, rather than relying solely on application middleware.
3. **Reactive Triggers:** Ratings, review statistics, and user profile provisioning are executed transactionally via native PL/pgSQL database triggers.
4. **Relational Integrity:** Foreign keys enforce strict referential actions (`ON DELETE CASCADE` or `RESTRICT`), eliminating orphaned records.

---

## 2. Entity-Relationship Diagram (ERD)

The following diagram illustrates all relational models, keys, and foreign-key associations:

```mermaid
erDiagram
    auth_users ||--o| profiles : "creates (1:1)"
    profiles ||--o{ pgs : "owns (1:N)"
    profiles ||--o{ reviews : "writes (1:N)"
    profiles ||--o{ favorites : "bookmarks (1:N)"
    pgs ||--o{ images : "has (1:N)"
    pgs ||--o{ reviews : "receives (1:N)"
    pgs ||--o{ favorites : "saved_in (1:N)"
    pgs ||--o{ inquiries : "receives (1:N)"
    pgs ||--o{ pg_amenities : "features (M:N)"
    amenities ||--o{ pg_amenities : "included_in (M:N)"
    pgs ||--o{ pg_nearby_places : "located_near (1:N)"

    profiles {
        uuid id PK
        uuid auth_id FK
        bigint legacy_id
        text name
        text email UK
        text phone
        text role
        text bio
        text city
        text profile_picture
        timestamptz created_at
        timestamptz updated_at
    }

    pgs {
        bigint id PK
        uuid owner_id FK
        text title
        text description
        text slug UK
        text address
        text city
        text state
        text zip_code
        double_precision price
        double_precision price_single
        double_precision price_double
        double_precision price_triple
        text rules
        text gender_type
        text sharing_type
        text google_place_id UK
        text phone
        text website
        double_precision latitude
        double_precision longitude
        text google_maps_url
        text source
        text property_type
        text status
        double_precision deposit_amount
        double_precision maintenance_charges
        text cancellation_policy
        double_precision rating
        integer reviews_count
        timestamptz created_at
        timestamptz updated_at
    }

    images {
        bigint id PK
        bigint pg_id FK
        text url
        boolean is_primary
    }

    amenities {
        bigint id PK
        text name UK
        text icon
    }

    pg_amenities {
        bigint pg_id PK,FK
        bigint amenity_id PK,FK
    }

    pg_nearby_places {
        bigint id PK
        bigint pg_id FK
        text name
        text distance
        text type
    }

    reviews {
        bigint id PK
        bigint pg_id FK
        uuid user_id FK
        integer rating
        text comment
        timestamptz created_at
    }

    favorites {
        bigint id PK
        uuid user_id FK
        bigint pg_id FK
        timestamptz created_at
    }

    inquiries {
        bigint id PK
        bigint pg_id FK
        text name
        text email
        text phone
        text message
        text status
        timestamptz created_at
    }
```

---

## 3. Data Dictionary: Tables, Attributes & Parameters

### Table 1: `public.profiles`
Represents application user profiles, hosts, and administrative personnel. Synchronized automatically with `auth.users`.

| Column | Type | Constraints / Defaults | Description |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | `PRIMARY KEY, DEFAULT gen_random_uuid()` | Internal profile UUID identifier |
| `auth_id` | `uuid` | `UNIQUE, REFERENCES auth.users(id) ON DELETE SET NULL` | Linked Supabase Authentication user id |
| `legacy_id` | `bigint` | `UNIQUE` | Deprecated id preserved from Spring Boot H2 migration |
| `name` | `text` | `NOT NULL` | Full name of resident, host, or admin |
| `email` | `text` | `NOT NULL, UNIQUE` | Unique contact and login email address |
| `phone` | `text` | `NULLABLE` | Verified Indian contact number (e.g. +91...) |
| `role` | `text` | `NOT NULL, DEFAULT 'ROLE_USER', CHECK (role IN ('ROLE_USER', 'ROLE_OWNER', 'ROLE_ADMIN'))` | Role-based permission tier |
| `bio` | `text` | `NULLABLE` | Short biography for hosts or resident profiles |
| `city` | `text` | `NULLABLE` | Primary residential city |
| `profile_picture` | `text` | `NULLABLE` | Public CDN URL for avatar image |
| `created_at` | `timestamptz`| `NOT NULL, DEFAULT now()` | Record creation timestamp |
| `updated_at` | `timestamptz`| `NOT NULL, DEFAULT now()` | Last profile modification timestamp |

---

### Table 2: `public.pgs`
Core catalog table containing all paying guest accommodations, co-living spaces, and hostel listings.

| Column | Type | Constraints / Defaults | Description |
| :--- | :--- | :--- | :--- |
| `id` | `bigint` | `IDENTITY PRIMARY KEY` | Auto-incrementing numerical identifier |
| `owner_id` | `uuid` | `NOT NULL, REFERENCES public.profiles(id) ON DELETE RESTRICT` | Profile ID of the host/manager responsible |
| `title` | `text` | `NOT NULL` | Display title (e.g. "Stanza Living Boston House") |
| `description` | `text` | `NULLABLE` | Full marketing overview and property description |
| `slug` | `text` | `NOT NULL, UNIQUE` | SEO URL identifier (e.g. `stanza-living-koramangala-bangalore`) |
| `address` | `text` | `NOT NULL` | Full street location, landmark, sector |
| `city` | `text` | `NOT NULL` | Operating city (e.g. "Bengaluru", "Delhi", "Mumbai") |
| `state` | `text` | `NOT NULL` | State or Union Territory |
| `zip_code` | `text` | `NULLABLE` | PIN / Postal code |
| `price` | `double precision` | `NOT NULL` | Base display price per month in INR |
| `price_single` | `double precision` | `NULLABLE` | Private room rent per month in INR |
| `price_double` | `double precision` | `NULLABLE` | 2-sharing room rent per person in INR |
| `price_triple` | `double precision` | `NULLABLE` | 3-sharing or multi-bed room rent per person in INR |
| `rules` | `text` | `NULLABLE` | House rules (curfew, guests, smoking policy) |
| `gender_type` | `text` | `NULLABLE` | Resident restriction (`MALE`, `FEMALE`, `UNISEX`) |
| `sharing_type` | `text` | `NULLABLE` | Primary configuration (`SINGLE`, `DOUBLE`, `TRIPLE`) |
| `google_place_id`| `text` | `UNIQUE, NULLABLE` | Google Places ID for deduplication |
| `phone` | `text` | `NULLABLE` | Front-desk or manager phone number |
| `website` | `text` | `NULLABLE` | Official PG website or direct inquiry link |
| `latitude` | `double precision` | `NULLABLE` | Decimal latitude coordinate for GPS distance calculation |
| `longitude` | `double precision` | `NULLABLE` | Decimal longitude coordinate for GPS distance calculation |
| `google_maps_url`| `text` | `NULLABLE` | Direct Google Maps navigation URL |
| `source` | `text` | `NULLABLE` | Data origin (`ORGANIC`, `SCRAPER`, `PARTNER`) |
| `property_type` | `text` | `NULLABLE` | Category (`PG`, `HOSTEL`, `COLIVING`, `APARTMENT`) |
| `status` | `text` | `NOT NULL, DEFAULT 'APPROVED', CHECK (status IN ('DRAFT', 'PENDING_VERIFICATION', 'APPROVED', 'REJECTED', 'SUSPENDED', 'ARCHIVED'))` | Listing publication lifecycle state |
| `deposit_amount`| `double precision` | `NOT NULL, DEFAULT 5000` | Refundable security deposit in INR |
| `maintenance_charges` | `double precision`| `NULLABLE` | Monthly maintenance / utility charge in INR |
| `cancellation_policy` | `text` | `NULLABLE` | Refund rules (e.g. "30-day notice period") |
| `rating` | `double precision` | `NULLABLE` | Aggregate average rating (calculated automatically) |
| `reviews_count` | `integer` | `NOT NULL, DEFAULT 0` | Total approved reviews (calculated automatically) |
| `created_at` | `timestamptz` | `NOT NULL, DEFAULT now()` | Insertion timestamp |
| `updated_at` | `timestamptz` | `NOT NULL, DEFAULT now()` | Modification timestamp |

---

### Table 3: `public.images`
Stores photo URLs and primary display tags for each PG listing.

| Column | Type | Constraints / Defaults | Description |
| :--- | :--- | :--- | :--- |
| `id` | `bigint` | `IDENTITY PRIMARY KEY` | Primary key |
| `pg_id` | `bigint` | `NOT NULL, REFERENCES public.pgs(id) ON DELETE CASCADE` | Associated PG listing |
| `url` | `text` | `NOT NULL` | Supabase Storage CDN URL or external Unsplash image |
| `is_primary` | `boolean` | `DEFAULT false` | Flag identifying the thumbnail card image |

---

### Table 4: `public.amenities` & Table 5: `public.pg_amenities`
Stores catalogued amenities (Wifi, AC, Food, Gym) and maps them many-to-many to listings.

* **`public.amenities`**:
  * `id`: `bigint PRIMARY KEY`
  * `name`: `text NOT NULL UNIQUE` (e.g., "High-speed Wifi", "Daily Cleaning")
  * `icon`: `text` (Lucide icon identifier, e.g., `wifi`, `utensils`, `snowflake`)
* **`public.pg_amenities`**:
  * `pg_id`: `bigint NOT NULL REFERENCES public.pgs(id) ON DELETE CASCADE`
  * `amenity_id`: `bigint NOT NULL REFERENCES public.amenities(id) ON DELETE CASCADE`
  * Primary Key: `(pg_id, amenity_id)`

---

### Table 6: `public.pg_nearby_places`
Stores nearby hubs such as colleges, tech parks, and metro stations.

| Column | Type | Constraints / Defaults | Description |
| :--- | :--- | :--- | :--- |
| `id` | `bigint` | `IDENTITY PRIMARY KEY` | Identifier |
| `pg_id` | `bigint` | `NOT NULL, REFERENCES public.pgs(id) ON DELETE CASCADE` | Associated listing |
| `name` | `text` | `NULLABLE` | Name (e.g. "Manyata Tech Park", "Indiranagar Metro") |
| `distance` | `text` | `NULLABLE` | Proximity string (e.g. "500m", "1.2 km") |
| `type` | `text` | `NULLABLE` | Category (`METRO`, `TECH_PARK`, `COLLEGE`, `HOSPITAL`) |

---

### Table 7: `public.reviews`
User feedback, ratings (1 to 5), and qualitative testimonials.

| Column | Type | Constraints / Defaults | Description |
| :--- | :--- | :--- | :--- |
| `id` | `bigint` | `IDENTITY PRIMARY KEY` | Review record ID |
| `pg_id` | `bigint` | `NOT NULL, REFERENCES public.pgs(id) ON DELETE CASCADE` | Target property |
| `user_id` | `uuid` | `NOT NULL, REFERENCES public.profiles(id) ON DELETE CASCADE` | Author profile ID |
| `rating` | `integer` | `NOT NULL, CHECK (rating >= 1 AND rating <= 5)` | Star rating (1 to 5) |
| `comment` | `text` | `NULLABLE` | Detailed qualitative feedback |
| `created_at` | `timestamptz` | `NOT NULL, DEFAULT now()` | Review submission timestamp |

---

### Table 8: `public.favorites`
Bookmarked listings / user wishlists. Enforces uniqueness per user-property pair.

| Column | Type | Constraints / Defaults | Description |
| :--- | :--- | :--- | :--- |
| `id` | `bigint` | `IDENTITY PRIMARY KEY` | Identifier |
| `user_id` | `uuid` | `NOT NULL, REFERENCES public.profiles(id) ON DELETE CASCADE` | Bookmarking user |
| `pg_id` | `bigint` | `NOT NULL, REFERENCES public.pgs(id) ON DELETE CASCADE` | Bookmarked listing |
| `created_at` | `timestamptz` | `NOT NULL, DEFAULT now()` | Bookmark timestamp |
| *Constraint* | `UNIQUE(user_id, pg_id)` | Prevents duplicate wishlist entries |

---

### Table 9: `public.inquiries`
Booking leads, schedule visit requests, and contact submissions.

| Column | Type | Constraints / Defaults | Description |
| :--- | :--- | :--- | :--- |
| `id` | `bigint` | `IDENTITY PRIMARY KEY` | Lead ID |
| `pg_id` | `bigint` | `NULLABLE, REFERENCES public.pgs(id) ON DELETE SET NULL` | Inquired stay (null for general platform inquiries) |
| `name` | `text` | `NOT NULL` | Inquirer's full name |
| `email` | `text` | `NOT NULL` | Inquirer's contact email |
| `phone` | `text` | `NULLABLE` | Inquirer's phone number |
| `message` | `text` | `NULLABLE` | Move-in date inquiry, questions, or message |
| `status` | `text` | `NOT NULL, DEFAULT 'PENDING'` | Status (`PENDING`, `CONTACTED`, `SCHEDULED`, `CLOSED`) |
| `created_at` | `timestamptz` | `NOT NULL, DEFAULT now()` | Inquiry submission timestamp |

---

## 4. Triggers, Stored Procedures & Security Functions

### 1. `handle_new_user()` Trigger
Synchronizes Supabase Auth accounts with `public.profiles`. When a guest registers via email/password or OAuth, this trigger provisions their profile atomically:
```sql
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer
set search_path = public
as $$
declare
  requested_role text;
begin
  requested_role := coalesce(new.raw_user_meta_data ->> 'role', 'ROLE_USER');
  if requested_role not in ('ROLE_USER', 'ROLE_OWNER') then
    requested_role := 'ROLE_USER';
  end if;

  insert into public.profiles (auth_id, email, name, phone, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    nullif(new.raw_user_meta_data ->> 'phone', ''),
    requested_role
  )
  on conflict (email) do update set auth_id = excluded.auth_id;

  return new;
end;
$$;
```

### 2. `refresh_pg_rating()` Trigger
Guarantees real-time accuracy for ratings without running slow aggregate queries on every card render. Fires on `INSERT`, `UPDATE`, or `DELETE` on `public.reviews`:
```sql
create or replace function public.refresh_pg_rating()
returns trigger
language plpgsql security definer
set search_path = public
as $$
declare
  target bigint;
begin
  target := coalesce(new.pg_id, old.pg_id);
  update public.pgs p set
    rating = (
      select coalesce(round(avg(r.rating)::numeric, 2)::double precision, 0)
      from public.reviews r where r.pg_id = target
    ),
    reviews_count = (
      select count(*) from public.reviews r where r.pg_id = target
    )
  where p.id = target;
  return coalesce(new, old);
end;
$$;
```

### 3. Identity Sequence Synchronizer (`reseed_sequences()`)
When migrating records with existing numerical IDs (such as during bulk scraping or H2 legacy data import), PostgreSQL identity sequences must be re-anchored to `max(id) + 1` so future inserts do not conflict.
```sql
create or replace function public.reseed_sequences()
returns void
language sql security definer
set search_path = public
as $$
  select setval('public.pgs_id_seq', coalesce((select max(id) from public.pgs), 0) + 1, false);
  select setval('public.images_id_seq', coalesce((select max(id) from public.images), 0) + 1, false);
  select setval('public.reviews_id_seq', coalesce((select max(id) from public.reviews), 0) + 1, false);
  select setval('public.favorites_id_seq', coalesce((select max(id) from public.favorites), 0) + 1, false);
  select setval('public.inquiries_id_seq', coalesce((select max(id) from public.inquiries), 0) + 1, false);
  select setval('public.amenities_id_seq', coalesce((select max(id) from public.amenities), 0) + 1, false);
  select setval('public.pg_nearby_places_id_seq', coalesce((select max(id) from public.pg_nearby_places), 0) + 1, false);
$$;
```

---

## 5. Security Architecture & Row-Level Security (RLS)

All public tables have RLS enabled (`alter table ... enable row level security;`).

```mermaid
flowchart LR
    Request["Inbound API / DB Request"] --> AuthCheck{"Is Authenticated?"}
    AuthCheck -->|No (Anon)| PublicPolicy["Public Read / Inquiry Insert Policies"]
    AuthCheck -->|Yes| RoleCheck{"Check User Role"}
    RoleCheck -->|ROLE_USER| UserPolicy["Manage Own Favorites & Reviews"]
    RoleCheck -->|ROLE_OWNER| OwnerPolicy["Manage Owned PGs & Images"]
    RoleCheck -->|ROLE_ADMIN| AdminPolicy["Full Catalog & User Control"]
```

### RLS Policies Summary Matrix

| Table | Operation | Public / Anonymous | Registered User (`ROLE_USER`) | Property Owner (`ROLE_OWNER`) | Admin (`ROLE_ADMIN`) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`profiles`** | `SELECT` | Allowed (public profiles) | Allowed | Allowed | Allowed |
| | `UPDATE` | Denied | Own Profile only (`auth_id = auth.uid()`) | Own Profile only | All Profiles |
| **`pgs`** | `SELECT` | Allowed (browse approved stays) | Allowed | Allowed | Allowed |
| | `INSERT` | Denied | Denied | If `owner_id = self` | Allowed |
| | `UPDATE` | Denied | Denied | If `owner_id = self` | Allowed |
| | `DELETE` | Denied | Denied | If `owner_id = self` | Allowed |
| **`images`** | `SELECT` | Allowed | Allowed | Allowed | Allowed |
| | `WRITE` | Denied | Denied | If owner of parent PG | Allowed |
| **`reviews`** | `SELECT` | Allowed | Allowed | Allowed | Allowed |
| | `INSERT` | Denied | Allowed (`user_id = self`) | Allowed | Allowed |
| | `UPDATE` | Denied | Allowed (`user_id = self`) | Denied | Allowed |
| | `DELETE` | Denied | Allowed (`user_id = self`) | Denied | Allowed |
| **`favorites`** | `SELECT` | Denied (Client localStorage used) | Own favorites only | Own favorites only | All favorites |
| | `INSERT` | Denied | Own favorites only | Own favorites only | Allowed |
| | `DELETE` | Denied | Own favorites only | Own favorites only | Allowed |
| **`inquiries`** | `INSERT` | Allowed (Public contact form) | Allowed | Allowed | Allowed |
| | `SELECT` | Denied | Denied | Denied | Allowed |
| | `UPDATE` | Denied | Denied | Denied | Allowed |

---

## 6. End-to-End Operational Workflows

### Flow 1: Search, Filter & Location Queries
1. **User input:** User selects location ("Bengaluru" or "Near Me"), category ("Private Rooms"), and price range.
2. **Execution:**
   - City search queries use the index on `lower(city)`:
     ```sql
     select * from public.pgs
     where lower(city) = lower('bengaluru') and status = 'APPROVED';
     ```
   - "Near Me" GPS queries fetch listings with coordinate bounding boxes, calculating haversine spherical distance on the client/edge for minimal database CPU load.
3. **Data Hydration:** Listings join primary images in a single round-trip:
   ```javascript
   const { data } = await supabase
     .from('pgs')
     .select('*, images(id, url, is_primary)')
     .eq('status', 'APPROVED');
   ```

### Flow 2: Media Upload Pipeline
1. Image binary is passed to Supabase Storage:
   ```javascript
   const { data } = await supabase.storage
     .from('pg-images')
     .upload(`${pgId}/${fileName}`, fileBlob);
   ```
2. The generated public URL is inserted into `public.images`:
   ```javascript
   await supabase.from('images').insert({
     pg_id: pgId,
     url: publicUrl,
     is_primary: isPrimaryFlag
   });
   ```

### Flow 3: Scraping & Seeding Pipeline
1. Scrapers collect verified listings across Indian tech hubs (Bangalore, Gurgaon, Pune, Mumbai, Hyderabad, Noida).
2. `scripts/supabase/import-scraper.mjs` validates and parses incoming payloads:
   - Sanitizes price figures (estimating reasonable defaults per locality if omitted).
   - Generates unique SEO slugs.
   - Upserts into `public.pgs` using `google_place_id` to avoid duplicates.
   - Uploads photos to the `pg-images` bucket.
   - Executes `reseed_sequences()` to maintain auto-increment integrity.

---

## 7. Connection Architecture & Environment Configuration

### Client Initialization Matrix
Livio uses three distinct connection modes depending on the execution context:

| Context | Client Creator | Authentication Token | Capabilities |
| :--- | :--- | :--- | :--- |
| **Browser (Client Components)** | `createBrowserClient()` in `client.js` | Cookie-based session + Anon Key | Governed strictly by RLS |
| **SSR Server Components** | `createServerClient()` in `server.js` | Read/Write HTTP Cookies | Server rendering with authenticated context |
| **Scrapers & Admin Scripts** | `createClient(URL, SERVICE_ROLE)` | `SUPABASE_SERVICE_ROLE_KEY` | Bypasses RLS for bulk imports |

### Required Environment Variables

```bash
# Public variables (Client & Edge)
NEXT_PUBLIC_SUPABASE_URL="https://<your-project-ref>.supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
NEXT_PUBLIC_SITE_URL="https://livio.co.in"

# Private server variables (Never exposed to client)
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
POSTGRES_URL="postgresql://postgres:[PASSWORD]@db.<project-ref>.supabase.co:6543/postgres?pgbouncer=true"
```

---

## 8. Deployment, Backup & Management Guide

### 1. Applying Migrations
Apply the initial migration or schema updates directly using the migration file:
* **Option A: Supabase Dashboard SQL Editor**
  1. Open your Supabase Dashboard &rarr; SQL Editor.
  2. Paste contents of [`supabase/migrations/0001_init.sql`](file:///d:/Github/HomePg/supabase/migrations/0001_init.sql).
  3. Click **Run**.
* **Option B: Supabase CLI**
  ```bash
  supabase link --project-ref <your-project-ref>
  supabase db push
  ```
* **Option C: Automated Script**
  ```bash
  cd scripts/supabase
  npm install
  node apply-schema.mjs
  ```

### 2. Backups & Disaster Recovery
* **Point-in-Time Recovery (PITR):** Enable PITR in the Supabase Dashboard under Database &rarr; Backups for continuous WAL archiving (restoration down to the second).
* **Logical Database Dumps:**
  ```bash
  # Full backup of schema and data
  pg_dump -h db.<project-ref>.supabase.co -U postgres -d postgres -F c -b -v -f livio_backup.dump
  ```

### 3. Scaling & Index Optimization
To support growth to 100,000+ listings:
1. **Compound B-Tree Indexes:**
   ```sql
   create index if not exists idx_pgs_city_status on public.pgs (lower(city), status);
   create index if not exists idx_pgs_price_status on public.pgs (price, status);
   ```
2. **PostGIS Extension (Geo-Queries):**
   When moving beyond client-side haversine calculations, enable `postgis`:
   ```sql
   create extension if not exists postgis;
   alter table public.pgs add column if not exists geom geography(Point, 4326);
   update public.pgs set geom = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326) where latitude is not null;
   create index if not exists idx_pgs_geom on public.pgs using gist (geom);
   ```

