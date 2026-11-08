import { RouteCode, RouteMeta, Season, SeasonalLens } from '../types/index.js';

export const SEVEN_ROUTES: Record<RouteCode, RouteMeta> = {
  LIVU: {
    code: 'LIVU',
    name: 'Līvu Road (Līvu ceļš)',
    theme: ['Sea', 'Fishing', 'Coast', 'Maritime Culture'],
    description: 'Along the wild Baltic coastline and Livonian heritage shores from Kurzeme to Vidzeme stony beach.',
    geographicRegions: ['Kurzeme Coast', 'Kolka Horn', 'Vidzeme Coast', 'Jūrmala'],
    culturalFocus: 'Finno-Ugric coastal roots, wooden smoking huts, amber foraging, maritime legends'
  },
  DAUGAVA: {
    code: 'DAUGAVA',
    name: 'Daugava Road (Daugavas ceļš)',
    theme: ['River', 'Trade', 'History', 'Civilization'],
    description: 'The ancient River of Destiny that nurtured Latvian trade, medieval strongholds, and epic folklore.',
    geographicRegions: ['River Daugava Valley', 'Koknese Ruins', 'Likteņdārzs', 'Daugavpils Fortress'],
    culturalFocus: 'Trade routes of antiquity, amber road intersection, castle mounds, folk memory'
  },
  BALTIC_WAY: {
    code: 'BALTIC_WAY',
    name: 'Baltic Way (Baltijas ceļš)',
    theme: ['Freedom', 'Cooperation', 'Shared History'],
    description: 'The historic route commemorating the peaceful 1989 human chain joining Estonia, Latvia, and Lithuania.',
    geographicRegions: ['Bauska', 'Riga Freedom Boulevard', 'Sigulda', 'Valmiera Border'],
    culturalFocus: 'Peaceful resistance, democratic unity, modern Baltic brotherhood, oral histories'
  },
  JACOB: {
    code: 'JACOB',
    name: 'Jacob Road (Jēkaba ceļš)',
    theme: ['Entrepreneurship', 'Innovation', 'Trade'],
    description: 'Inspired by Duke Jacob of Courland’s golden age of shipwrights, craft guilds, and early enterprise.',
    geographicRegions: ['Kuldīga', 'Ventspils Port', 'Jelgava Palace', 'Sabile Vineyards'],
    culturalFocus: 'Master craftsmanship, brick bridges, traditional water mills, innovative regional enterprise'
  },
  FREEDOM: {
    code: 'FREEDOM',
    name: 'Freedom Road (Brīvības ceļš)',
    theme: ['Leadership', 'Statehood', 'Identity'],
    description: 'The path of Latvian sovereignty, battles of independence, and intellectual enlightenment.',
    geographicRegions: ['Riga Historic Center', 'Cēsis Medieval Castle', 'Oskars Kalpaks Memorials'],
    culturalFocus: 'Constitutional bravery, statehood struggle, heroic legends, civic identity'
  },
  LIGHT: {
    code: 'LIGHT',
    name: 'Light Road (Gaismas ceļš)',
    theme: ['Knowledge', 'Learning', 'Education'],
    description: 'The intellectual highway of folk teachers, song festivals, astronomy, and modern academia.',
    geographicRegions: ['Riga Castle of Light', 'Tartu-Riga academic trail', 'Valmiera', 'Piebalga'],
    culturalFocus: 'Dainas song collections, early schools, printing houses, modern innovation labs'
  },
  MARA: {
    code: 'MARA',
    name: 'Māra Road (Māras ceļš)',
    theme: ['Traditions', 'Food', 'Crafts', 'Spiritual Heritage'],
    description: 'The deep spiritual heartland honoring Māra (guardian of earth, fertility, and hospitality) and Latgalian pottery.',
    geographicRegions: ['Latgale Lake District', 'Aglona Basilica', 'Rēzekne', 'Preiļi'],
    culturalFocus: 'Black pottery, rye bread rituals, herb healing, sacred nature groves, polyphonic singing'
  },
  RIGA_GATEWAY: {
    code: 'RIGA_GATEWAY',
    name: 'Rīga Gateway (R0–R3 Hub)',
    theme: ['Entry', 'Access', 'Architecture', 'Urban Elegance'],
    description: 'The vibrant cosmopolitan center: UNESCO Art Nouveau, medieval vaults, and Central Market culinary cornucopia.',
    geographicRegions: ['Vecrīga (Old Town)', 'Quiet Center Art Nouveau', 'Daugava Waterfront'],
    culturalFocus: 'Hanseatic guild houses, culinary reinvention, museum masterworks, gateway logistics'
  }
};

export const SEASON_LENSES: Record<Season, SeasonalLens> = {
  Spring: 'Awakening',
  Summer: 'Expansion',
  Autumn: 'Integration',
  Winter: 'Silence',
  All: 'Expansion'
};

export const SEASON_DESCRIPTIONS: Record<string, string> = {
  Spring: 'Awakening — Birch sap tapping, rushing rivers, blooming wild cherry orchards, Kemeri bog boardwalks.',
  Summer: 'Expansion — White nights, midsummer solstice flowers, open-air classical concerts, golden Baltic beaches.',
  Autumn: 'Integration — Amber-tinted Gauja valley foliage, forest foraging for chanterelles & porcini, harvest feasts.',
  Winter: 'Silence — Snow-laden pines, wood-fired black saunas, candlelit medieval taverns, frozen lake tranquility.'
};

export const TRAVELLER_PARTY_SIZES: Record<string, number> = {
  'Alone': 1,
  'Couple': 2,
  'Family': 4,
  'Friends': 4,
  'Business Delegation': 6
};

export const INTEREST_TO_ROUTES: Record<string, RouteCode[]> = {
  'History': ['BALTIC_WAY', 'FREEDOM', 'DAUGAVA', 'RIGA_GATEWAY'],
  'Nature': ['LIVU', 'DAUGAVA', 'MARA'],
  'Culture': ['MARA', 'LIGHT', 'BALTIC_WAY', 'RIGA_GATEWAY'],
  'Wellness': ['LIVU', 'MARA', 'RIGA_GATEWAY'],
  'Food': ['MARA', 'JACOB', 'RIGA_GATEWAY'],
  'Education': ['LIGHT', 'BALTIC_WAY', 'FREEDOM'],
  'Art': ['RIGA_GATEWAY', 'LIGHT', 'MARA'],
  'Business': ['JACOB', 'FREEDOM', 'RIGA_GATEWAY'],
  'Luxury Experiences': ['RIGA_GATEWAY', 'LIVU', 'JACOB'],
  'Adventure': ['LIVU', 'DAUGAVA', 'JACOB']
};
