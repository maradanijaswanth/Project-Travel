export type SupplierCategory = 'Hotel' | 'Restaurant' | 'Activity' | 'Transport';
export type Season = 'All' | 'Spring' | 'Summer' | 'Autumn' | 'Winter';
export type SeasonalLens = 'Awakening' | 'Expansion' | 'Integration' | 'Silence';
export type MaturityLevel = 'M0' | 'M1' | 'M2' | 'M3' | 'M4';
export type PriceTier = 'Budget' | 'Standard' | 'Premium' | 'Luxury';
export type JourneyStatus = 'DRAFT' | 'OPS_REVIEW' | 'APPROVED' | 'CONFIRMED' | 'REJECTED';
export type UserRole = 'ADMIN' | 'OPERATOR' | 'SUPPLIER' | 'CUSTOMER';
export type ProvenanceType = 
  | 'CURRENT_OFFER'
  | 'SUPPLIER_CLAIM'
  | 'CO_DESIGN_PROPOSAL'
  | 'FIELD_VERIFIED'
  | 'APPROVED_COMMERCIAL';

export type RouteCode = 
  | 'LIVU'
  | 'DAUGAVA'
  | 'BALTIC_WAY'
  | 'JACOB'
  | 'FREEDOM'
  | 'LIGHT'
  | 'MARA'
  | 'RIGA_GATEWAY';

export interface RouteMeta {
  code: RouteCode;
  name: string;
  theme: string[];
  description: string;
  geographicRegions: string[];
  culturalFocus: string;
}

export interface CustomerIntentInput {
  fullName: string;
  email: string;
  phone?: string;
  tripPurpose: string;
  travellerType: string;
  durationDays: number;
  season: 'Spring' | 'Summer' | 'Autumn' | 'Winter';
  budgetLevel?: PriceTier;
  specialNeeds?: string;
  selectedInterests: string[];
}

export interface EligibilityFilterCriteria {
  season: 'Spring' | 'Summer' | 'Autumn' | 'Winter';
  partySize: number;
  durationDays: number;
  budgetLevel?: PriceTier;
  interests: string[];
  specialNeeds?: string;
}

export interface ComposedItineraryDay {
  dayNumber: number;
  theme: string;
  slots: {
    timeSlot: 'MORNING' | 'AFTERNOON' | 'EVENING' | 'FULL_DAY';
    moduleId: string;
    moduleTitle: string;
    supplierName: string;
    category: SupplierCategory;
    routeCode: RouteCode;
    durationHours: number;
    priceEur: number;
    locationName: string;
    whyRecommended: string;
    notes?: string;
  }[];
}

export interface CompositionResult {
  journeyId: string;
  customerId: string;
  title: string;
  summary: string;
  status: JourneyStatus;
  totalDays: number;
  season: string;
  primaryRoute: RouteCode;
  estimatedBudgetEur: number;
  budgetTier: PriceTier;
  aiConfidenceScore: number;
  aiRationale: string;
  suggestedHotel: {
    supplierName: string;
    priceRange: string;
    location: string;
    whyRecommended: string;
  };
  recommendedActivities: string[];
  foodExperiences: string[];
  transport: {
    type: string;
    supplierName: string;
    whyRecommended: string;
  };
  dailyPlan: ComposedItineraryDay[];
}
