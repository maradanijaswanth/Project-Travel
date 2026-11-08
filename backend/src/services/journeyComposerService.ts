import { PrismaClient } from '@prisma/client';
import { CustomerIntentInput, RouteCode, SupplierCategory, CompositionResult, ComposedItineraryDay } from '../types/index.js';
import { SEVEN_ROUTES, TRAVELLER_PARTY_SIZES, INTEREST_TO_ROUTES } from '../config/constants.js';
import { EligibilityEngine, ModuleCandidate } from './eligibilityEngine.js';
import { AIService } from './aiService.js';

export class JourneyComposerService {
  private prisma: PrismaClient;
  private aiService: AIService;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.aiService = new AIService();
  }

  /**
   * Main entrypoint: Composes a personalized Latvia journey from customer questionnaire answers
   */
  public async composeJourney(intent: CustomerIntentInput): Promise<CompositionResult> {
    const partySize = TRAVELLER_PARTY_SIZES[intent.travellerType] || 2;

    // 1. Determine Primary Route candidate from selected interests
    const primaryRoute = this.determinePrimaryRoute(intent.selectedInterests, intent.tripPurpose);

    // 2. Fetch all modules with suppliers and capabilities from database
    const rawModules = await this.prisma.module.findMany({
      include: {
        supplier: true,
        capability: true,
      },
    });

    // 3. Filter through Eligibility Engine (Maturity M3/M4, Season, Capacity, Duration)
    const eligibleModules: { module: ModuleCandidate; relevanceScore: number; auditNote: string }[] = [];

    for (const m of rawModules) {
      const candidate: ModuleCandidate = {
        module_id: m.module_id,
        title: m.title,
        description: m.description,
        category: m.category,
        route_code: m.route_code,
        seasonal_lens: m.seasonal_lens,
        seasons_supported: m.seasons_supported,
        target_segments: m.target_segments,
        duration_hours: m.duration_hours,
        indicative_price_eur: m.indicative_price_eur,
        price_tier: m.price_tier,
        location_name: m.location_name,
        maturity_level: m.maturity_level,
        requires_human_quote: m.requires_human_quote,
        supplier: {
          supplier_id: m.supplier.supplier_id,
          name: m.supplier.name,
          category: m.supplier.category,
          season: m.supplier.season,
          capacity: m.supplier.capacity,
          price_range: m.supplier.price_range,
          location: m.supplier.location,
          status: m.supplier.status,
          maturity_level: m.supplier.maturity_level,
        },
        capability: m.capability ? {
          capability_id: m.capability.capability_id,
          name: m.capability.name,
          participation_mode: m.capability.participation_mode,
          is_winter_capable: m.capability.is_winter_capable,
          is_private_group_feasible: m.capability.is_private_group_feasible,
        } : null,
      };

      const evalResult = EligibilityEngine.evaluate(candidate, {
        season: intent.season,
        partySize,
        durationDays: intent.durationDays,
        budgetLevel: intent.budgetLevel,
        interests: intent.selectedInterests,
        specialNeeds: intent.specialNeeds,
      });

      if (evalResult.isEligible) {
        eligibleModules.push({
          module: candidate,
          relevanceScore: evalResult.relevanceScore,
          auditNote: evalResult.fitAuditNote,
        });
      }
    }

    // Sort eligible by relevance score descending
    eligibleModules.sort((a, b) => b.relevanceScore - a.relevanceScore);

    // 4. Categorize candidates
    const eligibleHotels = eligibleModules.filter(e => e.module.category === 'Hotel');
    const eligibleRestaurants = eligibleModules.filter(e => e.module.category === 'Restaurant');
    const eligibleActivities = eligibleModules.filter(e => e.module.category === 'Activity');
    const eligibleTransports = eligibleModules.filter(e => e.module.category === 'Transport');

    // Select primary hotel
    const selectedHotel = eligibleHotels[0]?.module || rawModules.find(m => m.category === 'Hotel');
    const selectedTransport = eligibleTransports[0]?.module || rawModules.find(m => m.category === 'Transport');

    // 5. Select activities and restaurants based on duration and route alignment
    const chosenActivities = eligibleActivities.map(e => e.module);
    const chosenRestaurants = eligibleRestaurants.map(e => e.module);

    // 6. Build Day-by-Day Plan
    const dailyPlan: ComposedItineraryDay[] = [];
    let estimatedBudget = 0;

    // Base hotel cost per day
    const hotelNightlyRate = selectedHotel ? selectedHotel.indicative_price_eur : 180;
    estimatedBudget += hotelNightlyRate * Math.max(1, intent.durationDays - 1);

    // Transport cost
    if (selectedTransport) {
      estimatedBudget += selectedTransport.indicative_price_eur * (intent.durationDays > 3 ? 2 : 1);
    }

    // Generate AI Narrative / Explanations
    const narrative = await this.aiService.generateJourneyNarrative(
      intent,
      primaryRoute,
      selectedHotel ? selectedHotel.supplier.name : 'Grand Poet Hotel',
      chosenActivities.map(a => ({ title: a.title, category: a.category, routeCode: a.route_code })),
      chosenRestaurants.map(r => ({ title: r.title })),
      selectedTransport ? selectedTransport.supplier.name : 'Private Chauffeur Service'
    );

    // Distribute activities across days
    let actIndex = 0;
    let restIndex = 0;

    for (let day = 1; day <= intent.durationDays; day++) {
      const slots: ComposedItineraryDay['slots'] = [];
      let dayTheme = '';

      if (day === 1) {
        dayTheme = 'Arrival, Orientation & Historic Immersion';
        // Morning/Arrival: Airport Transfer
        if (selectedTransport) {
          slots.push({
            timeSlot: 'MORNING',
            moduleId: selectedTransport.module_id,
            moduleTitle: selectedTransport.title,
            supplierName: selectedTransport.supplier.name,
            category: 'Transport',
            routeCode: selectedTransport.route_code as RouteCode,
            durationHours: selectedTransport.duration_hours,
            priceEur: selectedTransport.indicative_price_eur,
            locationName: selectedTransport.location_name,
            whyRecommended: narrative.transportWhy,
            notes: 'Airport greeting and private scenic transfer to hotel',
          });
        }
        // Afternoon: Central or Old Town activity
        const day1Activity = chosenActivities[actIndex % chosenActivities.length];
        if (day1Activity) {
          slots.push({
            timeSlot: 'AFTERNOON',
            moduleId: day1Activity.module_id,
            moduleTitle: day1Activity.title,
            supplierName: day1Activity.supplier.name,
            category: 'Activity',
            routeCode: day1Activity.route_code as RouteCode,
            durationHours: day1Activity.duration_hours,
            priceEur: day1Activity.indicative_price_eur,
            locationName: day1Activity.location_name,
            whyRecommended: narrative.activityExplanations[day1Activity.title] || `Ideal gentle orientation activity for Day 1.`,
          });
          estimatedBudget += day1Activity.indicative_price_eur;
          actIndex++;
        }
        // Evening: Dinner
        const dinner = chosenRestaurants[restIndex % chosenRestaurants.length];
        if (dinner) {
          slots.push({
            timeSlot: 'EVENING',
            moduleId: dinner.module_id,
            moduleTitle: dinner.title,
            supplierName: dinner.supplier.name,
            category: 'Restaurant',
            routeCode: dinner.route_code as RouteCode,
            durationHours: dinner.duration_hours,
            priceEur: dinner.indicative_price_eur,
            locationName: dinner.location_name,
            whyRecommended: narrative.foodExplanations[dinner.title] || `Atmospheric welcome dinner in Riga vaults.`,
          });
          estimatedBudget += dinner.indicative_price_eur;
          restIndex++;
        }
      } else if (day === intent.durationDays) {
        dayTheme = 'Reflection, Crafts & Farewell Tasting';
        // Morning Activity (e.g. Pottery or Cooking class)
        const closingActivity = chosenActivities[actIndex % chosenActivities.length];
        if (closingActivity) {
          slots.push({
            timeSlot: 'MORNING',
            moduleId: closingActivity.module_id,
            moduleTitle: closingActivity.title,
            supplierName: closingActivity.supplier.name,
            category: 'Activity',
            routeCode: closingActivity.route_code as RouteCode,
            durationHours: closingActivity.duration_hours,
            priceEur: closingActivity.indicative_price_eur,
            locationName: closingActivity.location_name,
            whyRecommended: narrative.activityExplanations[closingActivity.title] || `Hands-on heritage experience to close your stay.`,
          });
          estimatedBudget += closingActivity.indicative_price_eur;
          actIndex++;
        }
        // Afternoon: Farewell Lunch / River Cruise
        const secondActivity = chosenActivities[actIndex % chosenActivities.length];
        if (secondActivity) {
          slots.push({
            timeSlot: 'AFTERNOON',
            moduleId: secondActivity.module_id,
            moduleTitle: secondActivity.title,
            supplierName: secondActivity.supplier.name,
            category: 'Activity',
            routeCode: secondActivity.route_code as RouteCode,
            durationHours: secondActivity.duration_hours,
            priceEur: secondActivity.indicative_price_eur,
            locationName: secondActivity.location_name,
            whyRecommended: narrative.activityExplanations[secondActivity.title] || `Scenic afternoon relaxation.`,
          });
          estimatedBudget += secondActivity.indicative_price_eur;
          actIndex++;
        }
        // Evening: Final dinner
        const dinner = chosenRestaurants[restIndex % chosenRestaurants.length];
        if (dinner) {
          slots.push({
            timeSlot: 'EVENING',
            moduleId: dinner.module_id,
            moduleTitle: dinner.title,
            supplierName: dinner.supplier.name,
            category: 'Restaurant',
            routeCode: dinner.route_code as RouteCode,
            durationHours: dinner.duration_hours,
            priceEur: dinner.indicative_price_eur,
            locationName: dinner.location_name,
            whyRecommended: narrative.foodExplanations[dinner.title] || `Memorable farewell gastronomic tasting.`,
          });
          estimatedBudget += dinner.indicative_price_eur;
          restIndex++;
        }
      } else {
        dayTheme = `Exploring the ${SEVEN_ROUTES[primaryRoute]?.name || 'Latvia Route'}`;
        // Morning: Route activity
        const morningAct = chosenActivities[actIndex % chosenActivities.length];
        if (morningAct) {
          slots.push({
            timeSlot: 'MORNING',
            moduleId: morningAct.module_id,
            moduleTitle: morningAct.title,
            supplierName: morningAct.supplier.name,
            category: 'Activity',
            routeCode: morningAct.route_code as RouteCode,
            durationHours: morningAct.duration_hours,
            priceEur: morningAct.indicative_price_eur,
            locationName: morningAct.location_name,
            whyRecommended: narrative.activityExplanations[morningAct.title] || `Core exploration module along ${SEVEN_ROUTES[primaryRoute]?.name}.`,
          });
          estimatedBudget += morningAct.indicative_price_eur;
          actIndex++;
        }
        // Afternoon: Second route activity or nature
        const afternoonAct = chosenActivities[actIndex % chosenActivities.length];
        if (afternoonAct) {
          slots.push({
            timeSlot: 'AFTERNOON',
            moduleId: afternoonAct.module_id,
            moduleTitle: afternoonAct.title,
            supplierName: afternoonAct.supplier.name,
            category: 'Activity',
            routeCode: afternoonAct.route_code as RouteCode,
            durationHours: afternoonAct.duration_hours,
            priceEur: afternoonAct.indicative_price_eur,
            locationName: afternoonAct.location_name,
            whyRecommended: narrative.activityExplanations[afternoonAct.title] || `Immersive seasonal experience.`,
          });
          estimatedBudget += afternoonAct.indicative_price_eur;
          actIndex++;
        }
        // Evening dinner
        const dinner = chosenRestaurants[restIndex % chosenRestaurants.length];
        if (dinner) {
          slots.push({
            timeSlot: 'EVENING',
            moduleId: dinner.module_id,
            moduleTitle: dinner.title,
            supplierName: dinner.supplier.name,
            category: 'Restaurant',
            routeCode: dinner.route_code as RouteCode,
            durationHours: dinner.duration_hours,
            priceEur: dinner.indicative_price_eur,
            locationName: dinner.location_name,
            whyRecommended: narrative.foodExplanations[dinner.title] || `Distinctive local dining experience.`,
          });
          estimatedBudget += dinner.indicative_price_eur;
          restIndex++;
        }
      }

      dailyPlan.push({
        dayNumber: day,
        theme: dayTheme,
        slots,
      });
    }

    // 7. Persist Customer & Journey in Database
    const customer = await this.prisma.customer.create({
      data: {
        full_name: intent.fullName,
        email: intent.email,
        phone: intent.phone || null,
        trip_purpose: intent.tripPurpose,
        traveller_type: intent.travellerType,
        duration_days: intent.durationDays,
        season: intent.season,
        budget_level: intent.budgetLevel || 'Standard',
        special_needs: intent.specialNeeds || null,
        selected_interests: JSON.stringify(intent.selectedInterests),
      },
    });

    const journey = await this.prisma.journey.create({
      data: {
        customer_id: customer.customer_id,
        title: narrative.journeyTitle,
        summary: narrative.summary,
        status: 'DRAFT', // Always begins in DRAFT; "AI composes. Humans validate."
        total_days: intent.durationDays,
        season: intent.season,
        primary_route: primaryRoute,
        estimated_budget_eur: Math.round(estimatedBudget),
        budget_tier: intent.budgetLevel || 'Standard',
        ai_confidence_score: 0.92,
        ai_rationale: narrative.aiRationale,
        operator_notes: 'AI draft generated. Awaiting human operator slot and seasonal review.',
      },
    });

    // 8. Persist Itinerary Slots
    for (const day of dailyPlan) {
      let sortOrder = 0;
      for (const slot of day.slots) {
        await this.prisma.itinerary.create({
          data: {
            journey_id: journey.journey_id,
            day_number: day.dayNumber,
            time_slot: slot.timeSlot,
            module_id: slot.moduleId,
            custom_title: slot.moduleTitle,
            notes: slot.notes || null,
            why_recommended: slot.whyRecommended,
            sort_order: sortOrder++,
          },
        });
      }
    }

    // 9. Initial Audit Record
    await this.prisma.approval.create({
      data: {
        journey_id: journey.journey_id,
        reviewer_name: 'EXIMIA AI Engine v1.0',
        from_status: 'DRAFT',
        to_status: 'DRAFT',
        decision: 'COMPOSED_DRAFT',
        comments: 'Journey automatically composed based on customer intent. Ready for operator review.',
        slot_checked: false,
        pricing_checked: false,
        safety_checked: false,
      },
    });

    return {
      journeyId: journey.journey_id,
      customerId: customer.customer_id,
      title: journey.title,
      summary: journey.summary,
      status: 'DRAFT',
      totalDays: journey.total_days,
      season: journey.season,
      primaryRoute: journey.primary_route as RouteCode,
      estimatedBudgetEur: journey.estimated_budget_eur,
      budgetTier: journey.budget_tier as any,
      aiConfidenceScore: journey.ai_confidence_score,
      aiRationale: journey.ai_rationale,
      suggestedHotel: {
        supplierName: selectedHotel ? selectedHotel.supplier.name : 'Grand Poet Hotel',
        priceRange: selectedHotel ? selectedHotel.price_tier : 'Premium',
        location: selectedHotel ? selectedHotel.location_name : 'Riga Center',
        whyRecommended: narrative.hotelWhy,
      },
      recommendedActivities: chosenActivities.map(a => a.title),
      foodExperiences: chosenRestaurants.map(r => r.title),
      transport: {
        type: selectedTransport ? selectedTransport.title : 'Chauffeur Service',
        supplierName: selectedTransport ? selectedTransport.supplier.name : 'Prime Chauffeur Latvia',
        whyRecommended: narrative.transportWhy,
      },
      dailyPlan,
    };
  }

  private determinePrimaryRoute(interests: string[], purpose: string): RouteCode {
    const routeScores: Record<RouteCode, number> = {
      LIVU: 0,
      DAUGAVA: 0,
      BALTIC_WAY: 0,
      JACOB: 0,
      FREEDOM: 0,
      LIGHT: 0,
      MARA: 0,
      RIGA_GATEWAY: 1, // baseline
    };

    interests.forEach(interest => {
      const routes = INTEREST_TO_ROUTES[interest] || [];
      routes.forEach(r => {
        routeScores[r] = (routeScores[r] || 0) + 2;
      });
    });

    // Purpose nudges
    if (purpose.includes('Cultural') || purpose.includes('History')) {
      routeScores.BALTIC_WAY += 3;
      routeScores.FREEDOM += 2;
    } else if (purpose.includes('Nature')) {
      routeScores.LIVU += 3;
      routeScores.DAUGAVA += 2;
    } else if (purpose.includes('Food') || purpose.includes('Culinary')) {
      routeScores.MARA += 4;
    } else if (purpose.includes('Business') || purpose.includes('Investment')) {
      routeScores.JACOB += 3;
      routeScores.RIGA_GATEWAY += 2;
    } else if (purpose.includes('Educational')) {
      routeScores.LIGHT += 4;
    }

    let topRoute: RouteCode = 'BALTIC_WAY';
    let maxScore = -1;
    for (const [code, score] of Object.entries(routeScores) as [RouteCode, number][]) {
      if (score > maxScore) {
        maxScore = score;
        topRoute = code;
      }
    }

    return topRoute;
  }
}
