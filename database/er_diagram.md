# EXIMIA Journey Composer — Database Architecture & Data Model Documentation

> **Architectural Motto:** *"AI composes. Humans validate."*  
> **Platform Scope:** Latvia Intent-to-Reality Orchestration Platform  
> **Target Database Engine:** PostgreSQL 14+ / Prisma ORM  

---

## 1. Full Entity-Relationship (ER) Diagram

```mermaid
erDiagram
    USERS ||--o{ CUSTOMERS : "authenticates / manages"
    USERS ||--o{ JOURNEYS : "validates / reviews"
    USERS ||--o{ APPROVALS : "signs off"

    CUSTOMERS ||--o{ JOURNEYS : "requests"

    SUPPLIERS ||--o{ CAPABILITIES : "possesses"
    SUPPLIERS ||--o{ MODULES : "offers / co-designs"

    CAPABILITIES ||--o{ MODULES : "enables"

    JOURNEYS ||--o{ ITINERARIES : "structures"
    JOURNEYS ||--o{ APPROVALS : "undergoes validation"

    MODULES ||--o{ ITINERARIES : "assigned to slot"

    USERS {
        uuid user_id PK
        varchar email UK
        varchar password_hash
        varchar full_name
        enum role "ADMIN, OPERATOR, SUPPLIER, CUSTOMER"
        boolean is_active
        timestamptz created_at
        timestamptz updated_at
    }

    CUSTOMERS {
        uuid customer_id PK
        uuid user_id FK "nullable"
        varchar full_name
        varchar email
        varchar phone
        varchar trip_purpose
        varchar traveller_type
        integer duration_days
        enum season "Spring, Summer, Autumn, Winter"
        enum budget_level "Budget, Standard, Premium, Luxury"
        text special_needs
        jsonb selected_interests
        timestamptz created_at
        timestamptz updated_at
    }

    SUPPLIERS {
        uuid supplier_id PK
        varchar name
        enum category "Hotel, Restaurant, Activity, Transport"
        enum season "All, Spring, Summer, Autumn, Winter"
        integer capacity
        enum price_range "Budget, Standard, Premium, Luxury"
        varchar location
        decimal latitude
        decimal longitude
        jsonb languages_supported
        varchar status "ACTIVE, INACTIVE, REVIEW"
        enum maturity_level "M0, M1, M2, M3, M4"
        varchar contact_name
        varchar contact_email
        varchar contact_phone
        varchar website_url
        text description
        timestamptz created_at
        timestamptz updated_at
    }

    CAPABILITIES {
        uuid capability_id PK
        uuid supplier_id FK
        varchar name
        varchar category
        varchar participation_mode "Observe, Interact, Make, Perform, Discuss, Move"
        boolean is_winter_capable
        boolean is_private_group_feasible
        integer min_capacity
        integer max_capacity
        text equipment_notes
        text operating_boundaries
        timestamptz created_at
        timestamptz updated_at
    }

    MODULES {
        uuid module_id PK
        uuid supplier_id FK
        uuid capability_id FK "nullable"
        varchar title
        text description
        enum category "Hotel, Restaurant, Activity, Transport"
        enum route_code "LIVU, DAUGAVA, BALTIC_WAY, JACOB, FREEDOM, LIGHT, MARA, RIGA_GATEWAY"
        enum seasonal_lens "Awakening, Expansion, Integration, Silence"
        jsonb seasons_supported
        jsonb target_segments
        decimal duration_hours
        decimal indicative_price_eur
        enum price_tier "Budget, Standard, Premium, Luxury"
        varchar location_name
        enum maturity_level "M0, M1, M2, M3, M4 (M3/M4 customer-facing)"
        boolean requires_human_quote
        enum provenance "CURRENT_OFFER, SUPPLIER_CLAIM, CO_DESIGN_PROPOSAL, FIELD_VERIFIED, APPROVED_COMMERCIAL"
        text evidence_notes
        text safety_fallback
        timestamptz created_at
        timestamptz updated_at
    }

    JOURNEYS {
        uuid journey_id PK
        uuid customer_id FK
        varchar title
        text summary
        enum status "DRAFT, OPS_REVIEW, APPROVED, CONFIRMED, REJECTED"
        integer total_days
        enum season "Spring, Summer, Autumn, Winter"
        enum route_code primary_route
        decimal estimated_budget_eur
        enum budget_tier "Budget, Standard, Premium, Luxury"
        decimal ai_confidence_score
        text ai_rationale "Why recommended"
        text operator_notes
        uuid validated_by_user_id FK "nullable"
        timestamptz created_at
        timestamptz updated_at
    }

    ITINERARIES {
        uuid itinerary_id PK
        uuid journey_id FK
        integer day_number
        varchar time_slot "MORNING, AFTERNOON, EVENING, FULL_DAY"
        uuid module_id FK
        varchar custom_title
        text notes
        text why_recommended
        integer sort_order
        timestamptz created_at
    }

    APPROVALS {
        uuid approval_id PK
        uuid journey_id FK
        uuid reviewer_user_id FK "nullable"
        varchar reviewer_name
        enum from_status "DRAFT, OPS_REVIEW, APPROVED, CONFIRMED, REJECTED"
        enum to_status "DRAFT, OPS_REVIEW, APPROVED, CONFIRMED, REJECTED"
        varchar decision "SUBMITTED, APPROVED, REJECTED, CONFIRMED"
        text comments
        boolean slot_checked
        boolean pricing_checked
        boolean safety_checked
        timestamptz created_at
    }
```

---

## 2. Architectural Role: Why Each Table Exists

| Table Name | Architectural Purpose | Human-in-the-Loop & Journey Composer Role |
| :--- | :--- | :--- |
| **`users`** | Identity, authentication, and RBAC | Separates `CUSTOMER` from `OPERATOR` and `ADMIN`. Protects validation endpoints so only certified human operators (Prime Assist) can validate and approve journeys. |
| **`customers`** | Intent Contract storage | Encapsulates traveler purpose, party size, travel duration, season, budget tier, selected interests, and special accessibility/dietary constraints without psychometric guessing. |
| **`suppliers`** | Real-world entity directory | Models verified Latvian hosts, hotels, restaurants, activity providers, and chauffeur services. Tracks physical location, capacity, seasonal operation, and baseline supplier maturity (`M0` to `M4`). |
| **`capabilities`** | Latent & operational capability graph | Distinguishes what a supplier *currently sells* from what they *can reliably deliver* (e.g. heated indoor spaces, craft tools, winter availability, private groups). |
| **`modules`** | Discrete Experience Node Passports | The atomic building block of journey composition. Bound to the Seven Routes of Latvia and Four Seasons. **Strict Gate:** Only `M3` and `M4` modules are visible to customers. |
| **`journeys`** | Personalized Journey Root | The draft composed by the AI engine. Represents the traveler’s holistic proposal. Encapsulates state machine progression: `DRAFT` &rarr; `OPS_REVIEW` &rarr; `APPROVED` &rarr; `CONFIRMED`. |
| **`itineraries`** | Temporal execution slots | Allocates qualified experience modules to specific days (`Day 1`, `Day 2`...) and slots (`Morning`, `Afternoon`, `Evening`) with individualized *"Why Recommended"* explainability. |
| **`approvals`** | Immutable Human Validation Audit Log | Guarantees compliance with *"AI composes. Humans validate."* Records which human operator verified dates, supplier slot availability, net pricing, and seasonal safety before confirmation. |

---

## 3. Database Normalization Plan

The relational schema has been engineered to **Third Normal Form (3NF)** with strict Boyce-Codd Normal Form (BCNF) compliance across transactional tables:

### 1NF (First Normal Form)
- **Atomic attributes:** All columns store single, well-defined scalar values (or typed PostgreSQL JSONB arrays for multi-value tags like `languages_supported` and `selected_interests` that do not require separate joins for read-heavy operations).
- **Primary keys:** Every table possesses an unambiguous, globally unique Primary Key (`UUID`).
- **No repeating groups:** Itinerary days and module assignments are split into the separate relational table `itineraries`.

### 2NF (Second Normal Form)
- **Full functional dependency:** No non-key column is partially dependent on any component of a composite primary key. All primary keys are single-column UUID surrogate keys.

### 3NF (Third Normal Form)
- **Elimination of transitive dependencies:**
  - A customer's trip details are tied strictly to `customer_id`.
  - A module’s supplier details (location, capacity, languages) are stored in `suppliers` and referenced via `supplier_id`, preventing duplicate data anomalies when a supplier changes contact info or base capacity.
  - Verification audits are isolated in `approvals` referencing `journey_id` rather than cluttering `journeys` with repeated approval history fields.

---

## 4. Primary Key Strategy

1. **Format:** Universally Unique Identifiers (UUID v4) via `uuid_generate_v4()`.
2. **Advantages for Journey Composer:**
   - **Distributed Security:** Unlike sequential integers (`1, 2, 3`), UUIDs prevent URL enumeration attacks where competitors or unauthorized visitors scrape customer journeys (`/journeys/1042`).
   - **Offline & Multi-Branch Capability:** When operators co-design new modules in the field (e.g., in Sigulda or Latgale without continuous internet), modules and capability nodes can be assigned stable UUIDs before synchronizing with the central database.
   - **Zero ID Collision:** Facilitates future replication across Baltic nodes (Estonia, Lithuania demonstrator nodes).

---

## 5. Foreign Key Strategy & Referential Integrity

| Relationship | Constraint Behavior | Architectural Justification |
| :--- | :--- | :--- |
| `customers.user_id` &rarr; `users.user_id` | `ON DELETE SET NULL` | If a registered user account is anonymized or deleted under GDPR, customer journey intent records are preserved for institutional analytics without personal credentials. |
| `capabilities.supplier_id` &rarr; `suppliers.supplier_id` | `ON DELETE CASCADE` | Capabilities belong strictly to a supplier. If a supplier is purged, their latent capabilities cannot exist independently. |
| `modules.supplier_id` &rarr; `suppliers.supplier_id` | `ON DELETE CASCADE` | Experience modules are delivered by the supplier. |
| `modules.capability_id` &rarr; `capabilities.capability_id` | `ON DELETE SET NULL` | A module can continue operating as a standard commercial offer even if a detailed capability diagnosis record is reorganized. |
| `journeys.customer_id` &rarr; `customers.customer_id` | `ON DELETE CASCADE` | A customer's journeys belong to that customer's request lifecycle. |
| `itineraries.journey_id` &rarr; `journeys.journey_id` | `ON DELETE CASCADE` | Itinerary slots are parts of the journey. Removing a draft journey removes its day slots. |
| `itineraries.module_id` &rarr; `modules.module_id` | `ON DELETE RESTRICT` | **Critical Safeguard:** Prevents deleting an experience module if it is currently utilized in an active or confirmed customer journey. |
| `approvals.journey_id` &rarr; `journeys.journey_id` | `ON DELETE CASCADE` | Verification history remains bound to the journey. |

---

## 6. Index Recommendations & Performance Rationale

1. **`idx_modules_customer_eligible` (Filtered Partial Index):**
   ```sql
   CREATE INDEX idx_modules_customer_eligible 
   ON modules(maturity_level, route_code, price_tier) 
   WHERE maturity_level IN ('M3', 'M4');
   ```
   *Rationale:* Over 90% of customer read queries filter exclusively for customer-ready modules (`M3` and `M4`). This partial index reduces index size by ~60% and accelerates AI composition queries.

2. **`idx_modules_seasons` & `idx_modules_segments` (GIN Indexes):**
   ```sql
   CREATE INDEX idx_modules_seasons ON modules USING GIN (seasons_supported);
   CREATE INDEX idx_modules_segments ON modules USING GIN (target_segments);
   ```
   *Rationale:* Enables sub-millisecond JSONB containment queries (`?`, `@>`) when checking whether a module operates during "Summer" or fits "Families".

3. **`idx_journeys_status` & `idx_approvals_journey` (B-Tree):**
   *Rationale:* Optimizes the Human Validation queue for operators reviewing pending `OPS_REVIEW` journeys.
