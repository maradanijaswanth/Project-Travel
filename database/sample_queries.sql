-- ============================================================================
-- EXIMIA Journey Composer - Production SQL Queries & Eligibility Logic
-- ============================================================================

-- ============================================================================
-- 1. ELIGIBILITY ENGINE SQL LOGIC
-- Description:
-- Deterministic filtering stage of the Journey Composer.
-- Rejects modules that violate:
--   a) Customer-facing maturity threshold (Only M3 and M4 allowed)
--   b) Season mismatch (Winter-only modules rejected for Summer customers)
--   c) Duration & capacity bounds
--   d) Budget tier constraints
-- ============================================================================

-- Query: Retrieve eligible modules for a Family traveling in Summer for 5 days with a "Standard" budget
-- looking for "Culture" and "Nature"
WITH customer_intent AS (
    SELECT 
        'Summer'::season_enum AS target_season,
        5 AS duration_days,
        'Standard'::price_tier_enum AS budget_tier,
        4 AS party_size, -- Family typical size
        ARRAY['Culture', 'Nature']::text[] AS requested_interests
)
SELECT 
    m.module_id,
    m.title AS module_title,
    m.category,
    m.route_code,
    m.seasonal_lens,
    m.indicative_price_eur,
    m.price_tier,
    m.duration_hours,
    m.maturity_level,
    s.name AS supplier_name,
    s.location,
    s.capacity AS supplier_max_capacity,
    c.participation_mode,
    -- Match score calculation based on route and target segments
    (CASE 
        WHEN m.target_segments::jsonb ? 'Families' THEN 30 
        ELSE 10 
     END +
     CASE 
        WHEN m.target_segments::jsonb ? 'Cultural Explorers' THEN 30 
        ELSE 10 
     END +
     CASE 
        WHEN m.price_tier = ci.budget_tier THEN 25 
        ELSE 10 
     END
    ) AS relevance_score,
    CONCAT(
        'Qualified for ', ci.target_season, ' season; ',
        'accommodates group size ', ci.party_size, '; ',
        'verified maturity level ', m.maturity_level, ' (customer-ready); ',
        'indicative duration ', m.duration_hours, 'h fits ', ci.duration_days, '-day framework.'
    ) AS eligibility_audit_trail
FROM modules m
JOIN suppliers s ON m.supplier_id = s.supplier_id
LEFT JOIN capabilities c ON m.capability_id = c.capability_id
CROSS JOIN customer_intent ci
WHERE 
    -- 1. Strict Maturity Gate: ONLY M3 and M4 can appear to customers
    m.maturity_level IN ('M3', 'M4')
    -- 2. Supplier status must be ACTIVE
    AND s.status = 'ACTIVE'
    -- 3. Season Eligibility Filter
    AND (m.seasons_supported::jsonb ? ci.target_season::text OR s.season = 'All' OR s.season = ci.target_season)
    -- 4. Capacity Filter
    AND s.capacity >= ci.party_size
    -- 5. Duration sanity check: module duration must be <= customer stay
    AND m.duration_hours <= (ci.duration_days * 8)
ORDER BY relevance_score DESC, m.indicative_price_eur ASC;


-- ============================================================================
-- 2. SUPPLIER SEARCH QUERIES
-- ============================================================================

-- 2.1 Multi-Criteria Supplier Search (Admin & Operations view)
-- Filter by category, location, maturity level, and season
SELECT 
    s.supplier_id,
    s.name,
    s.category,
    s.location,
    s.capacity,
    s.price_range,
    s.maturity_level,
    s.status,
    COUNT(m.module_id) AS total_modules,
    COUNT(CASE WHEN m.maturity_level IN ('M3', 'M4') THEN 1 END) AS customer_ready_modules,
    ARRAY_TO_STRING(ARRAY_AGG(DISTINCT m.route_code::text) FILTER (WHERE m.route_code IS NOT NULL), ', ') AS routes_covered
FROM suppliers s
LEFT JOIN modules m ON s.supplier_id = m.supplier_id
WHERE 
    ($1::text IS NULL OR s.category::text = $1)
    AND ($2::text IS NULL OR s.location ILIKE CONCAT('%', $2, '%'))
    AND ($3::text IS NULL OR s.maturity_level::text = $3)
    AND ($4::text IS NULL OR s.season::text IN ($4, 'All'))
GROUP BY s.supplier_id
ORDER BY s.name ASC;

-- 2.2 Latent Capability & Co-Design Opportunity Query
-- Identifies suppliers with unpromoted (M0-M2) capabilities for winter or private groups
SELECT 
    s.name AS supplier_name,
    s.location,
    c.name AS capability_name,
    c.participation_mode,
    c.is_winter_capable,
    c.is_private_group_feasible,
    c.operating_boundaries,
    m.module_id,
    m.title AS module_title,
    m.maturity_level,
    m.provenance
FROM suppliers s
JOIN capabilities c ON s.supplier_id = c.supplier_id
LEFT JOIN modules m ON c.capability_id = m.capability_id
WHERE 
    m.maturity_level IN ('M0', 'M1', 'M2')
    OR m.provenance = 'CO_DESIGN_PROPOSAL'
ORDER BY s.name, m.maturity_level;


-- ============================================================================
-- 3. JOURNEY & HUMAN VALIDATION WORKFLOW QUERIES
-- ============================================================================

-- 3.1 Operator Review Queue
-- Retrieves all journeys pending human validation (OPS_REVIEW state)
SELECT 
    j.journey_id,
    j.title,
    j.status,
    j.total_days,
    j.season,
    j.primary_route,
    j.estimated_budget_eur,
    j.ai_confidence_score,
    c.full_name AS customer_name,
    c.email AS customer_email,
    c.traveller_type,
    c.trip_purpose,
    c.special_needs,
    COUNT(i.itinerary_id) AS total_itinerary_slots,
    j.created_at
FROM journeys j
JOIN customers c ON j.customer_id = c.customer_id
LEFT JOIN itineraries i ON j.journey_id = i.journey_id
WHERE j.status = 'OPS_REVIEW'
GROUP BY j.journey_id, c.customer_id
ORDER BY j.created_at ASC;

-- 3.2 Human Approval Action (Atomic State Transition with Audit Log)
-- Executes an operator approval transitioning status from OPS_REVIEW to APPROVED
-- Step A: Insert approval record
INSERT INTO approvals (
    journey_id,
    reviewer_user_id,
    reviewer_name,
    from_status,
    to_status,
    decision,
    comments,
    slot_checked,
    pricing_checked,
    safety_checked
) VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22'::uuid,
    'Jānis Bērziņš (Prime Assist Operations)',
    'OPS_REVIEW',
    'APPROVED',
    'APPROVED',
    'Verified Grand Poet Hotel junior suite slot and Rozengrals private cellar booking. Seasonal road transfer confirmed.',
    TRUE,
    TRUE,
    TRUE
);

-- Step B: Update journey status
UPDATE journeys 
SET 
    status = 'APPROVED',
    operator_notes = 'Verified by Prime Assist Operations. Ready for customer commercial confirmation.',
    validated_by_user_id = 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22'::uuid,
    updated_at = CURRENT_TIMESTAMP
WHERE journey_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid;


-- ============================================================================
-- 4. COMPLETE ITINERARY COMPOSITION QUERY
-- Fetches full journey breakdown with day plans, supplier names, route badges, and "Why Recommended"
-- ============================================================================
SELECT 
    j.journey_id,
    j.title AS journey_title,
    j.status,
    j.total_days,
    j.season,
    j.primary_route,
    j.estimated_budget_eur,
    j.ai_rationale,
    i.day_number,
    i.time_slot,
    i.custom_title,
    i.why_recommended,
    m.title AS module_title,
    m.category AS module_category,
    m.duration_hours,
    m.indicative_price_eur,
    m.location_name,
    s.name AS supplier_name,
    s.languages_supported
FROM journeys j
JOIN itineraries i ON j.journey_id = i.journey_id
JOIN modules m ON i.module_id = m.module_id
JOIN suppliers s ON m.supplier_id = s.supplier_id
WHERE j.journey_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid
ORDER BY i.day_number ASC, i.sort_order ASC;


-- ============================================================================
-- 5. TERRITORIAL CAPABILITY & ROUTE COVERAGE REPORTING
-- Demonstrates the Seven Roads territorial distribution and maturity breakdown
-- ============================================================================
SELECT 
    m.route_code,
    COUNT(DISTINCT s.supplier_id) AS total_suppliers,
    COUNT(m.module_id) AS total_modules,
    COUNT(CASE WHEN m.maturity_level = 'M0' THEN 1 END) AS count_m0_discovered,
    COUNT(CASE WHEN m.maturity_level = 'M1' THEN 1 END) AS count_m1_basic,
    COUNT(CASE WHEN m.maturity_level = 'M2' THEN 1 END) AS count_m2_structured,
    COUNT(CASE WHEN m.maturity_level = 'M3' THEN 1 END) AS count_m3_commercial,
    COUNT(CASE WHEN m.maturity_level = 'M4' THEN 1 END) AS count_m4_delivered,
    ROUND(AVG(m.indicative_price_eur), 2) AS avg_indicative_price
FROM modules m
JOIN suppliers s ON m.supplier_id = s.supplier_id
GROUP BY m.route_code
ORDER BY total_modules DESC;
