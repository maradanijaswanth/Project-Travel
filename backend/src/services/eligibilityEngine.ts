import { EligibilityFilterCriteria } from '../types/index.js';

export interface ModuleCandidate {
  module_id: string;
  title: string;
  description: string;
  category: string;
  route_code: string;
  seasonal_lens: string;
  seasons_supported: string; // JSON string
  target_segments: string; // JSON string
  duration_hours: number;
  indicative_price_eur: number;
  price_tier: string;
  location_name: string;
  maturity_level: string;
  requires_human_quote: boolean;
  supplier: {
    supplier_id: string;
    name: string;
    category: string;
    season: string;
    capacity: number;
    price_range: string;
    location: string;
    status: string;
    maturity_level: string;
  };
  capability?: {
    capability_id: string;
    name: string;
    participation_mode: string;
    is_winter_capable: boolean;
    is_private_group_feasible: boolean;
  } | null;
}

export interface EligibilityEvaluationResult {
  isEligible: boolean;
  rejectionReason?: string;
  relevanceScore: number;
  fitAuditNote: string;
}

export class EligibilityEngine {
  /**
   * Deterministically evaluates whether a module candidate satisfies
   * all physical, seasonal, maturity, and capacity constraints.
   */
  public static evaluate(
    module: ModuleCandidate,
    criteria: EligibilityFilterCriteria
  ): EligibilityEvaluationResult {
    // RULE 1: Customer Maturity Gate (Strict: Only M3 and M4 can appear to customers)
    if (!['M3', 'M4'].includes(module.maturity_level)) {
      return {
        isEligible: false,
        rejectionReason: `Maturity level ${module.maturity_level} is internal-only; customers only see M3/M4 validated offers.`,
        relevanceScore: 0,
        fitAuditNote: 'Blocked by Stage Gate: Non-commercial maturity.'
      };
    }

    // RULE 2: Supplier Status Check
    if (module.supplier.status !== 'ACTIVE') {
      return {
        isEligible: false,
        rejectionReason: `Supplier ${module.supplier.name} is currently ${module.supplier.status}.`,
        relevanceScore: 0,
        fitAuditNote: 'Supplier operational status inactive.'
      };
    }

    // RULE 3: Seasonality Eligibility
    // If experience is Winter-only, do not show for Summer customer.
    let supportedSeasons: string[] = [];
    try {
      supportedSeasons = JSON.parse(module.seasons_supported);
    } catch {
      supportedSeasons = [module.supplier.season];
    }

    const matchesSeason =
      supportedSeasons.includes('All') ||
      supportedSeasons.map(s => s.toLowerCase()).includes(criteria.season.toLowerCase()) ||
      module.supplier.season.toLowerCase() === criteria.season.toLowerCase() ||
      module.supplier.season === 'All';

    if (!matchesSeason) {
      return {
        isEligible: false,
        rejectionReason: `Experience operates in [${supportedSeasons.join(', ')}], incompatible with traveller's ${criteria.season} visit.`,
        relevanceScore: 0,
        fitAuditNote: 'Seasonality conflict.'
      };
    }

    // RULE 4: Capacity & Party Size
    if (module.supplier.capacity < criteria.partySize) {
      return {
        isEligible: false,
        rejectionReason: `Supplier capacity (${module.supplier.capacity}) cannot accommodate group size (${criteria.partySize}).`,
        relevanceScore: 0,
        fitAuditNote: 'Insufficient supplier capacity.'
      };
    }

    // RULE 5: Duration Compatibility
    // If customer stays 3 days, do not suggest 8-day experiences or activities that exceed reasonable day hours
    const maxAllowedActivityHours = Math.min(criteria.durationDays * 8, 12);
    if (module.duration_hours > maxAllowedActivityHours && module.category !== 'Hotel') {
      return {
        isEligible: false,
        rejectionReason: `Module duration (${module.duration_hours}h) exceeds reasonable allocation for a ${criteria.durationDays}-day stay.`,
        relevanceScore: 0,
        fitAuditNote: 'Duration budget exceeded.'
      };
    }

    // RULE 6: Scoring calculation
    let relevanceScore = 50; // base score for eligible modules
    const reasons: string[] = [];

    // Check target segments
    let segments: string[] = [];
    try {
      segments = JSON.parse(module.target_segments);
    } catch {
      segments = [];
    }

    // Budget alignment
    if (criteria.budgetLevel) {
      if (module.price_tier.toLowerCase() === criteria.budgetLevel.toLowerCase()) {
        relevanceScore += 25;
        reasons.push(`Exact budget tier match (${module.price_tier})`);
      } else if (
        (criteria.budgetLevel === 'Luxury' && module.price_tier === 'Premium') ||
        (criteria.budgetLevel === 'Standard' && (module.price_tier === 'Budget' || module.price_tier === 'Premium'))
      ) {
        relevanceScore += 10;
        reasons.push(`Compatible budget tier (${module.price_tier})`);
      } else if (criteria.budgetLevel === 'Budget' && module.price_tier === 'Luxury') {
        relevanceScore -= 30; // penalize high mismatch
      }
    }

    // Special needs accessibility checks
    if (criteria.specialNeeds) {
      const lowerNeeds = criteria.specialNeeds.toLowerCase();
      if (lowerNeeds.includes('accessibility') || lowerNeeds.includes('wheelchair')) {
        if (module.description.toLowerCase().includes('barrier-free') || module.supplier.location.includes('Riga')) {
          relevanceScore += 15;
          reasons.push('Meets stated accessibility needs');
        }
      }
      if (lowerNeeds.includes('kids') || lowerNeeds.includes('family')) {
        if (segments.some(s => s.toLowerCase().includes('famili'))) {
          relevanceScore += 20;
          reasons.push('Designed specifically for family & children');
        }
      }
    }

    // Season bonus
    reasons.push(`Verified operational readiness for ${criteria.season}`);
    reasons.push(`Accommodates party size of ${criteria.partySize}`);

    const fitAuditNote = reasons.join('; ');

    return {
      isEligible: true,
      relevanceScore,
      fitAuditNote
    };
  }
}
