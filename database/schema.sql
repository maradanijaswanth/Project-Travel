-- ============================================================================
-- EXIMIA Journey Composer - Production PostgreSQL Database Schema
-- Architecture Principle: "AI composes. Humans validate."
-- Target Engine: PostgreSQL 14+
-- ============================================================================

-- Enable UUID extension for cryptographically secure, collision-free identifiers
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- ENUM TYPES DEFINITIONS
-- ============================================================================

DO $$ BEGIN
    CREATE TYPE supplier_category_enum AS ENUM ('Hotel', 'Restaurant', 'Activity', 'Transport');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE season_enum AS ENUM ('All', 'Spring', 'Summer', 'Autumn', 'Winter');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE seasonal_lens_enum AS ENUM ('Awakening', 'Expansion', 'Integration', 'Silence');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE maturity_level_enum AS ENUM ('M0', 'M1', 'M2', 'M3', 'M4');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE price_tier_enum AS ENUM ('Budget', 'Standard', 'Premium', 'Luxury');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE journey_status_enum AS ENUM ('DRAFT', 'OPS_REVIEW', 'APPROVED', 'CONFIRMED', 'REJECTED');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE user_role_enum AS ENUM ('ADMIN', 'OPERATOR', 'SUPPLIER', 'CUSTOMER');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE provenance_type_enum AS ENUM (
        'CURRENT_OFFER',
        'SUPPLIER_CLAIM',
        'CO_DESIGN_PROPOSAL',
        'FIELD_VERIFIED',
        'APPROVED_COMMERCIAL'
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE route_code_enum AS ENUM (
        'LIVU',          -- Livu Road: Sea, Fishing, Coast, Maritime Culture
        'DAUGAVA',       -- Daugava Road: River, Trade, History, Civilization
        'BALTIC_WAY',    -- Baltic Way: Freedom, Cooperation, Shared History
        'JACOB',         -- Jacob Road: Entrepreneurship, Innovation, Trade
        'FREEDOM',       -- Freedom Road: Leadership, Statehood, Identity
        'LIGHT',         -- Light Road: Knowledge, Learning, Education
        'MARA',          -- Mara Road: Traditions, Food, Crafts, Spiritual Heritage
        'RIGA_GATEWAY'   -- Riga Gateway: Entry, Access, Time & Radius Hub
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================================
-- 1. USERS TABLE (Authentication & Role-Based Access Control)
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    role user_role_enum NOT NULL DEFAULT 'CUSTOMER',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- ============================================================================
-- 2. CUSTOMERS TABLE (Intent Collection & Traveler Profiles)
-- ============================================================================
CREATE TABLE IF NOT EXISTS customers (
    customer_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    trip_purpose VARCHAR(100) NOT NULL,
    traveller_type VARCHAR(50) NOT NULL,
    duration_days INTEGER NOT NULL CHECK (duration_days > 0 AND duration_days <= 90),
    season season_enum NOT NULL,
    budget_level price_tier_enum DEFAULT 'Standard',
    special_needs TEXT,
    selected_interests JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_customers_season ON customers(season);
CREATE INDEX IF NOT EXISTS idx_customers_budget ON customers(budget_level);
CREATE INDEX IF NOT EXISTS idx_customers_purpose ON customers(trip_purpose);
CREATE INDEX IF NOT EXISTS idx_customers_created_at ON customers(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_customers_interests ON customers USING GIN (selected_interests);

-- ============================================================================
-- 3. SUPPLIERS TABLE (Latvia Verified & Prospect Supplier Network)
-- ============================================================================
CREATE TABLE IF NOT EXISTS suppliers (
    supplier_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    category supplier_category_enum NOT NULL,
    season season_enum NOT NULL DEFAULT 'All',
    capacity INTEGER NOT NULL DEFAULT 1 CHECK (capacity >= 1),
    price_range price_tier_enum NOT NULL DEFAULT 'Standard',
    location VARCHAR(200) NOT NULL,
    latitude DECIMAL(9, 6),
    longitude DECIMAL(9, 6),
    languages_supported JSONB NOT NULL DEFAULT '["English", "Latvian"]'::jsonb,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    maturity_level maturity_level_enum NOT NULL DEFAULT 'M1',
    contact_name VARCHAR(150),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    website_url VARCHAR(255),
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_suppliers_category ON suppliers(category);
CREATE INDEX IF NOT EXISTS idx_suppliers_maturity ON suppliers(maturity_level);
CREATE INDEX IF NOT EXISTS idx_suppliers_season ON suppliers(season);
CREATE INDEX IF NOT EXISTS idx_suppliers_status ON suppliers(status);
CREATE INDEX IF NOT EXISTS idx_suppliers_location ON suppliers(location);

-- ============================================================================
-- 4. CAPABILITIES TABLE (Latent & Operational Supplier Capabilities)
-- ============================================================================
CREATE TABLE IF NOT EXISTS capabilities (
    capability_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_id UUID NOT NULL REFERENCES suppliers(supplier_id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    category VARCHAR(100) NOT NULL,
    participation_mode VARCHAR(50) NOT NULL DEFAULT 'Interact', -- Observe, Interact, Make, Perform, Discuss, Move
    is_winter_capable BOOLEAN NOT NULL DEFAULT FALSE,
    is_private_group_feasible BOOLEAN NOT NULL DEFAULT TRUE,
    min_capacity INTEGER NOT NULL DEFAULT 1,
    max_capacity INTEGER NOT NULL DEFAULT 30,
    equipment_notes TEXT,
    operating_boundaries TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_capabilities_supplier ON capabilities(supplier_id);
CREATE INDEX IF NOT EXISTS idx_capabilities_winter ON capabilities(is_winter_capable);

-- ============================================================================
-- 5. MODULES TABLE (Experience Node Passports - Discrete Deliverable Units)
-- ============================================================================
CREATE TABLE IF NOT EXISTS modules (
    module_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_id UUID NOT NULL REFERENCES suppliers(supplier_id) ON DELETE CASCADE,
    capability_id UUID REFERENCES capabilities(capability_id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category supplier_category_enum NOT NULL,
    route_code route_code_enum NOT NULL,
    seasonal_lens seasonal_lens_enum NOT NULL,
    seasons_supported JSONB NOT NULL DEFAULT '["Spring", "Summer", "Autumn", "Winter"]'::jsonb,
    target_segments JSONB NOT NULL DEFAULT '["Families", "Cultural Explorers"]'::jsonb,
    duration_hours DECIMAL(4, 2) NOT NULL DEFAULT 2.0,
    indicative_price_eur DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    price_tier price_tier_enum NOT NULL DEFAULT 'Standard',
    location_name VARCHAR(200) NOT NULL,
    maturity_level maturity_level_enum NOT NULL DEFAULT 'M3',
    requires_human_quote BOOLEAN NOT NULL DEFAULT TRUE,
    provenance provenance_type_enum NOT NULL DEFAULT 'CURRENT_OFFER',
    evidence_notes TEXT,
    safety_fallback TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_modules_supplier ON modules(supplier_id);
CREATE INDEX IF NOT EXISTS idx_modules_maturity ON modules(maturity_level);
CREATE INDEX IF NOT EXISTS idx_modules_route ON modules(route_code);
CREATE INDEX IF NOT EXISTS idx_modules_category ON modules(category);
CREATE INDEX IF NOT EXISTS idx_modules_price_tier ON modules(price_tier);
CREATE INDEX IF NOT EXISTS idx_modules_seasons ON modules USING GIN (seasons_supported);
CREATE INDEX IF NOT EXISTS idx_modules_segments ON modules USING GIN (target_segments);

-- Filtered Index: ONLY customer-eligible modules (Maturity M3 and M4)
CREATE INDEX IF NOT EXISTS idx_modules_customer_eligible 
ON modules(maturity_level, route_code, price_tier) 
WHERE maturity_level IN ('M3', 'M4');

-- ============================================================================
-- 6. JOURNEYS TABLE (Personalized Latvia Journeys & Human Validation Pipeline)
-- ============================================================================
CREATE TABLE IF NOT EXISTS journeys (
    journey_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(customer_id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    summary TEXT NOT NULL,
    status journey_status_enum NOT NULL DEFAULT 'DRAFT',
    total_days INTEGER NOT NULL CHECK (total_days > 0),
    season season_enum NOT NULL,
    primary_route route_code_enum NOT NULL,
    estimated_budget_eur DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    budget_tier price_tier_enum NOT NULL DEFAULT 'Standard',
    ai_confidence_score DECIMAL(3, 2) DEFAULT 0.85,
    ai_rationale TEXT NOT NULL,
    operator_notes TEXT,
    validated_by_user_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_journeys_customer ON journeys(customer_id);
CREATE INDEX IF NOT EXISTS idx_journeys_status ON journeys(status);
CREATE INDEX IF NOT EXISTS idx_journeys_created_at ON journeys(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_journeys_primary_route ON journeys(primary_route);

-- ============================================================================
-- 7. ITINERARIES TABLE (Day-by-Day Journey Structure & Slot Assignments)
-- ============================================================================
CREATE TABLE IF NOT EXISTS itineraries (
    itinerary_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    journey_id UUID NOT NULL REFERENCES journeys(journey_id) ON DELETE CASCADE,
    day_number INTEGER NOT NULL CHECK (day_number > 0),
    time_slot VARCHAR(50) NOT NULL, -- MORNING, AFTERNOON, EVENING, FULL_DAY
    module_id UUID NOT NULL REFERENCES modules(module_id) ON DELETE RESTRICT,
    custom_title VARCHAR(255),
    notes TEXT,
    why_recommended TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_itineraries_journey_day ON itineraries(journey_id, day_number, sort_order);
CREATE INDEX IF NOT EXISTS idx_itineraries_module ON itineraries(module_id);

-- ============================================================================
-- 8. APPROVALS TABLE (Audit Trail for "AI composes. Humans validate.")
-- ============================================================================
CREATE TABLE IF NOT EXISTS approvals (
    approval_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    journey_id UUID NOT NULL REFERENCES journeys(journey_id) ON DELETE CASCADE,
    reviewer_user_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
    reviewer_name VARCHAR(150) NOT NULL,
    from_status journey_status_enum NOT NULL,
    to_status journey_status_enum NOT NULL,
    decision VARCHAR(50) NOT NULL, -- OPS_REVIEW_REQUESTED, APPROVED, REJECTED, CONFIRMED
    comments TEXT,
    slot_checked BOOLEAN NOT NULL DEFAULT FALSE,
    pricing_checked BOOLEAN NOT NULL DEFAULT FALSE,
    safety_checked BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_approvals_journey ON approvals(journey_id);
CREATE INDEX IF NOT EXISTS idx_approvals_created_at ON approvals(created_at DESC);
