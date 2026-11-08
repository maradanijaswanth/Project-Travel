import OpenAI from 'openai';
import { CustomerIntentInput, RouteCode, SupplierCategory } from '../types/index.js';
import { SEVEN_ROUTES, SEASON_DESCRIPTIONS, SEASON_LENSES } from '../config/constants.js';

export interface AIExplanationPayload {
  journeyTitle: string;
  summary: string;
  aiRationale: string;
  hotelWhy: string;
  transportWhy: string;
  activityExplanations: Record<string, string>;
  foodExplanations: Record<string, string>;
}

export class AIService {
  private openai: OpenAI | null = null;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey && apiKey.trim() !== '' && !apiKey.startsWith('mock')) {
      try {
        this.openai = new OpenAI({ apiKey });
      } catch (err) {
        console.warn('[AIService] Failed to initialize OpenAI client, using deterministic AI engine:', err);
        this.openai = null;
      }
    }
  }

  /**
   * Generates or enhances the journey explanation and reasoning
   */
  public async generateJourneyNarrative(
    intent: CustomerIntentInput,
    primaryRoute: RouteCode,
    hotelName: string,
    activities: { title: string; category: string; routeCode: string }[],
    restaurants: { title: string }[],
    transportType: string
  ): Promise<AIExplanationPayload> {
    const route = SEVEN_ROUTES[primaryRoute] || SEVEN_ROUTES.RIGA_GATEWAY;
    const seasonLens = SEASON_LENSES[intent.season] || 'Expansion';
    const seasonDesc = SEASON_DESCRIPTIONS[intent.season] || '';

    // If OpenAI API is available, try generating nuanced bespoke narrative
    if (this.openai) {
      try {
        const prompt = `
You are the EXIMIA Journey Composer AI for Latvia.
Principle: "AI composes. Humans validate."
Customer Profile:
- Purpose: ${intent.tripPurpose}
- Travelling with: ${intent.travellerType}
- Duration: ${intent.durationDays} days
- Season: ${intent.season} (Lens: ${seasonLens})
- Budget: ${intent.budgetLevel || 'Standard'}
- Interests: ${intent.selectedInterests.join(', ')}
- Special Needs: ${intent.specialNeeds || 'None'}
Selected Latvia Route: ${route.name} (${route.culturalFocus})
Selected Hotel: ${hotelName}
Selected Activities: ${activities.map(a => a.title).join(', ')}
Selected Food Experiences: ${restaurants.map(r => r.title).join(', ')}
Transport: ${transportType}

Generate a JSON response with:
{
  "journeyTitle": "Evocative title",
  "summary": "2-3 sentences overview connecting purpose and season",
  "aiRationale": "Explain why this was recommended: match to culture, nature, season, duration, and traveller profile",
  "hotelWhy": "Specific reason this hotel fits their intent",
  "transportWhy": "Specific reason this transport fits party and route",
  "activityExplanations": { "ActivityTitle": "Why this activity was chosen" },
  "foodExplanations": { "FoodTitle": "Why this restaurant was chosen" }
}
Output strictly valid JSON.
`;

        const completion = await this.openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are an expert Latvian cultural curator and travel architect adhering to EXIMIA principles.'
            },
            { role: 'user', content: prompt }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.7
        });

        const raw = completion.choices[0]?.message?.content;
        if (raw) {
          const parsed = JSON.parse(raw) as AIExplanationPayload;
          return parsed;
        }
      } catch (err) {
        console.warn('[AIService] OpenAI completion failed or timed out. Falling back to deterministic AI engine:', err);
      }
    }

    // Deterministic Rule-Grounded Engine Fallback
    const journeyTitle = `${intent.tripPurpose} along the ${route.name}`;
    const summary = `A bespoke ${intent.durationDays}-day Latvia journey calibrated for a ${intent.travellerType.toLowerCase()} during ${intent.season} (${seasonLens}). Blending authentic encounters along ${route.name} with premium comfort and seamless logistics.`;

    const interestString = intent.selectedInterests.length > 0
      ? intent.selectedInterests.join(' and ')
      : 'cultural heritage';

    const aiRationale = `This experience was composed because it matches your primary interest in ${interestString}, operates reliably during the ${intent.season} season (${seasonLens}), and fits your ${intent.durationDays}-day stay duration. It respects your ${intent.travellerType.toLowerCase()} party dynamics with balanced pacing, avoiding unverified seasonal closures.`;

    const hotelWhy = `${hotelName} was chosen as your primary base for its verified central accessibility, high operational rating, and seamless proximity to both Old Town walking trails and regional departure corridors.`;

    const transportWhy = `${transportType} provides stress-free, climate-controlled mobility tailored for your ${intent.travellerType.toLowerCase()} profile across Latvia's seasonal conditions.`;

    const activityExplanations: Record<string, string> = {};
    activities.forEach(a => {
      activityExplanations[a.title] = `Recommended for its strong alignment with ${route.culturalFocus}, verified operational status, and comfortable group pacing for ${intent.season}.`;
    });

    const foodExplanations: Record<string, string> = {};
    restaurants.forEach(r => {
      foodExplanations[r.title] = `Curated for authentic seasonal Latvian gastronomy, utilizing locally sourced harvest ingredients and distinctive culinary craftsmanship.`;
    });

    return {
      journeyTitle,
      summary,
      aiRationale,
      hotelWhy,
      transportWhy,
      activityExplanations,
      foodExplanations
    };
  }
}
