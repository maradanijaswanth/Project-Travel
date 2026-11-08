'use client';

import React, { useState } from 'react';
import { 
  Compass, 
  Sparkles, 
  Calendar, 
  Users, 
  Clock, 
  Sun, 
  CloudSnow, 
  Leaf, 
  Flower2, 
  HeartHandshake, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  ArrowLeft, 
  Hotel, 
  Utensils, 
  Car, 
  Layers, 
  ShieldCheck, 
  Coins, 
  ChevronRight, 
  ExternalLink,
  Info
} from 'lucide-react';
import { journeyApi } from '../services/api';

const PURPOSE_OPTIONS = [
  { value: 'Cultural Discovery', label: 'Cultural Discovery', desc: 'Ancient Hanseatic heritage, folk traditions & sacred spaces' },
  { value: 'Family Vacation', label: 'Family Vacation', desc: 'Comfortable pacing, captivating castles & nature discovery' },
  { value: 'Nature Exploration', label: 'Nature Exploration', desc: 'Primeval river valleys, sea coasts, and bog boardwalks' },
  { value: 'Wellness & Relaxation', label: 'Wellness & Relaxation', desc: 'Latvian smoke saunas, vitality spas, and tranquil forests' },
  { value: 'Food & Culinary Experience', label: 'Food & Culinary Experience', desc: 'Rye sourdough baking, Nordic-Latvian chefs, wild foraging' },
  { value: 'Business Trip', label: 'Business Trip', desc: 'Executive meetings, skyline hubs & seamless logistics' },
  { value: 'Investment / Business Opportunities', label: 'Investment & Opportunities', desc: 'Regional enterprise, port logistics & tech innovation' },
  { value: 'Educational Visit', label: 'Educational Visit', desc: 'Historical archives, architecture & song festival lore' },
  { value: 'Short Stopover', label: 'Short Stopover', desc: '1-2 day high-impact Old Town immersion' },
  { value: 'Other', label: 'Other / Bespoke', desc: 'Custom purpose tailored by human curator' },
];

const COMPANION_OPTIONS = [
  { value: 'Alone', label: 'Alone', desc: 'Solo explorer & retreat seeker' },
  { value: 'Couple', label: 'Couple', desc: 'Romantic, tranquil or culturally immersive' },
  { value: 'Family', label: 'Family', desc: 'Multi-generational, child-friendly balance' },
  { value: 'Friends', label: 'Friends', desc: 'Shared adventures, tasting & explorations' },
  { value: 'Business Delegation', label: 'Business Delegation', desc: 'Executive protocol, privacy & transport' },
];

const SEASONS = [
  { value: 'Spring', label: 'Spring', lens: 'Awakening', icon: Flower2, color: 'text-emerald-600 bg-emerald-50 border-emerald-200', desc: 'Birch sap tapping, blooming apple orchards, rushing rivers' },
  { value: 'Summer', label: 'Summer', lens: 'Expansion', icon: Sun, color: 'text-amber-600 bg-amber-50 border-amber-200', desc: 'White nights, Midsummer solstice, sea coast & open-air music' },
  { value: 'Autumn', label: 'Autumn', lens: 'Integration', icon: Leaf, color: 'text-orange-600 bg-orange-50 border-orange-200', desc: 'Golden Gauja valley foliage, mushroom foraging & harvest banquets' },
  { value: 'Winter', label: 'Winter', lens: 'Silence', icon: CloudSnow, color: 'text-blue-600 bg-blue-50 border-blue-200', desc: 'Snowshoe bog trails, authentic smoke saunas & candlelit vaults' },
];

const INTERESTS_LIST = [
  'History',
  'Nature',
  'Culture',
  'Wellness',
  'Food',
  'Education',
  'Art',
  'Business',
  'Luxury Experiences',
  'Adventure'
];

const BUDGET_OPTIONS = [
  { value: 'Budget', label: 'Budget', desc: 'Authentic guest houses & essential local highlights' },
  { value: 'Standard', label: 'Standard', desc: 'Comfortable 4-star hotels, select guided tours & fine dining' },
  { value: 'Premium', label: 'Premium', desc: 'Boutique design hotels, private guides & chef tastings' },
  { value: 'Luxury', label: 'Luxury', desc: '5-star suites, private chauffeur Mercedes escort & VIP access' },
];

export default function HomePage() {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isComposing, setIsComposing] = useState<boolean>(false);
  const [compositionStateMsg, setCompositionStateMsg] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [composedJourney, setComposedJourney] = useState<any>(null);
  const [submittedToReview, setSubmittedToReview] = useState<boolean>(false);

  // Form State
  const [formData, setFormData] = useState({
    tripPurpose: 'Cultural Discovery',
    travellerType: 'Couple',
    durationDays: 4,
    season: 'Summer',
    selectedInterests: ['Culture', 'History', 'Food'],
    budgetLevel: 'Premium',
    specialNeeds: '',
    fullName: '',
    email: '',
    phone: '',
  });

  const toggleInterest = (interest: string) => {
    setFormData(prev => {
      const exists = prev.selectedInterests.includes(interest);
      if (exists) {
        return { ...prev, selectedInterests: prev.selectedInterests.filter(i => i !== interest) };
      } else {
        return { ...prev, selectedInterests: [...prev.selectedInterests, interest] };
      }
    });
  };

  const handleCompose = async () => {
    if (!formData.fullName || !formData.email) {
      setErrorMsg('Please provide your name and email so our operations team can deliver your validation report.');
      return;
    }
    setErrorMsg('');
    setIsComposing(true);

    const states = [
      'Ingesting explicit intent & constraints...',
      'Executing Eligibility Engine: matching season, capacity, and duration...',
      'Filtering M3/M4 validated customer-ready modules...',
      'Aligning with the 7 Routes of Latvia & Riga Gateway...',
      'Synthesizing personalized Day-by-Day plan and rationale...',
    ];

    let i = 0;
    const interval = setInterval(() => {
      if (i < states.length) {
        setCompositionStateMsg(states[i]);
        i++;
      }
    }, 450);

    try {
      const res = await journeyApi.compose(formData);
      clearInterval(interval);
      if (res.success && res.data) {
        setComposedJourney(res.data);
        setCurrentStep(8); // Results view
      } else {
        setErrorMsg(res.error || 'Failed to compose journey');
      }
    } catch (err: any) {
      clearInterval(interval);
      setErrorMsg(err.message || 'Error occurred while contacting server');
    } finally {
      setIsComposing(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!composedJourney?.journeyId) return;
    try {
      const res = await journeyApi.submitReview(composedJourney.journeyId);
      if (res.success) {
        setSubmittedToReview(true);
        setComposedJourney({ ...composedJourney, status: 'OPS_REVIEW' });
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* STEP 0: WELCOME HERO */}
      {currentStep === 0 && (
        <div className="space-y-8 animate-fadeIn">
          {/* Header Banner */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-rose-950 to-amber-950 text-white p-8 sm:p-12 shadow-xl border border-rose-900/40">
            <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-rose-600/10 blur-3xl pointer-events-none"></div>
            <div className="absolute -left-16 -bottom-16 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none"></div>

            <div className="relative z-10 max-w-2xl space-y-4">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-amber-300 text-xs font-semibold tracking-wide border border-white/10">
                <Sparkles className="w-3.5 h-3.5" />
                <span>EXIMIA EXPERIENCE ARCHITECTURE</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
                Compose Your Latvia Journey
              </h1>
              <p className="text-slate-200 text-sm sm:text-base leading-relaxed">
                Tell us your purpose and we will create a personalized Latvia experience. 
                We connect your explicit intent with verified local supplier capabilities across the 7 Meaning Routes and 4 Seasons of Latvia.
              </p>

              {/* Core Philosophy Banner */}
              <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-2 mt-6">
                <div className="flex items-center space-x-2 text-rose-300 font-bold text-xs uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4 text-rose-300" />
                  <span>The System Principle</span>
                </div>
                <div className="text-sm font-semibold text-white">
                  &ldquo;AI composes. Humans validate.&rdquo;
                </div>
                <p className="text-xs text-slate-300 leading-normal">
                  This system is NOT an instant travel booking website. It generates intelligent draft journeys, which are subsequently audited and validated by human operators (Prime Assist) for live availability, safety, and transparent pricing.
                </p>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 text-slate-950 font-extrabold text-sm shadow-lg shadow-rose-950/40 hover:scale-105 active:scale-95 transition-all"
                >
                  <span>Begin Intent Questionnaire</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Three Pillars Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl glass-panel space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-sm">
                01
              </div>
              <h3 className="font-bold text-slate-900 text-base">Seven Routes of Latvia</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                From the sea-salted Līvu coast and the historic Baltic Way to the deep craftsmanship of Māra Road and Duke Jacob’s trading legacy.
              </p>
            </div>

            <div className="p-6 rounded-2xl glass-panel space-y-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center font-bold text-sm">
                02
              </div>
              <h3 className="font-bold text-slate-900 text-base">Four Seasonal Lenses</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Spring Awakening, Summer Expansion, Autumn Integration, and Winter Silence. Experiences strictly filtered for seasonal truth.
              </p>
            </div>

            <div className="p-6 rounded-2xl glass-panel space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold text-sm">
                03
              </div>
              <h3 className="font-bold text-slate-900 text-base">M3 & M4 Maturity Gate</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Only commercially verified (M3) and delivered (M4) modules appear in your composition. Zero unverified claims or hallucinated slots.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* QUESTIONNAIRE PROGRESS HEADER */}
      {currentStep >= 1 && currentStep <= 7 && (
        <div className="mb-8 space-y-4">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Intent Collection Step {currentStep} of 7</span>
            <span>{Math.round((currentStep / 7) * 100)}% Complete</span>
          </div>
          {/* Progress Bar */}
          <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-amber-500 via-rose-600 to-indigo-600 transition-all duration-300"
              style={{ width: `${(currentStep / 7) * 100}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* STEP 1: Main Reason for Visiting */}
      {currentStep === 1 && (
        <div className="space-y-6 glass-panel p-6 sm:p-10 rounded-3xl animate-fadeIn">
          <div>
            <span className="text-xs font-bold text-rose-700 tracking-wider uppercase">Question 1</span>
            <h2 className="text-2xl font-extrabold text-slate-900 mt-1">What is your main reason for visiting Latvia?</h2>
            <p className="text-xs text-slate-500 mt-1">Select the primary purpose that guides your experience.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {PURPOSE_OPTIONS.map((item) => {
              const selected = formData.tripPurpose === item.value;
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, tripPurpose: item.value })}
                  className={`text-left p-4 rounded-2xl border transition-all ${
                    selected
                      ? 'border-rose-600 bg-rose-50/70 shadow-sm ring-1 ring-rose-500'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900">{item.label}</span>
                    {selected && <CheckCircle2 className="w-4 h-4 text-rose-600 flex-shrink-0" />}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
                </button>
              );
            })}
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-100">
            <button
              onClick={() => setCurrentStep(0)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              Back
            </button>
            <button
              onClick={() => setCurrentStep(2)}
              className="inline-flex items-center space-x-1.5 px-6 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors"
            >
              <span>Next: Travelling Party</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Travelling With */}
      {currentStep === 2 && (
        <div className="space-y-6 glass-panel p-6 sm:p-10 rounded-3xl animate-fadeIn">
          <div>
            <span className="text-xs font-bold text-rose-700 tracking-wider uppercase">Question 2</span>
            <h2 className="text-2xl font-extrabold text-slate-900 mt-1">Who are you travelling with?</h2>
            <p className="text-xs text-slate-500 mt-1">Party dynamics dictate supplier capacity and pacing.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {COMPANION_OPTIONS.map((item) => {
              const selected = formData.travellerType === item.value;
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, travellerType: item.value })}
                  className={`text-left p-4 rounded-2xl border transition-all ${
                    selected
                      ? 'border-rose-600 bg-rose-50/70 shadow-sm ring-1 ring-rose-500'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900">{item.label}</span>
                    {selected && <CheckCircle2 className="w-4 h-4 text-rose-600 flex-shrink-0" />}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
                </button>
              );
            })}
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-100">
            <button
              onClick={() => setCurrentStep(1)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              Back
            </button>
            <button
              onClick={() => setCurrentStep(3)}
              className="inline-flex items-center space-x-1.5 px-6 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors"
            >
              <span>Next: Duration</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Duration Days */}
      {currentStep === 3 && (
        <div className="space-y-6 glass-panel p-6 sm:p-10 rounded-3xl animate-fadeIn">
          <div>
            <span className="text-xs font-bold text-rose-700 tracking-wider uppercase">Question 3</span>
            <h2 className="text-2xl font-extrabold text-slate-900 mt-1">How many days will you stay in Latvia?</h2>
            <p className="text-xs text-slate-500 mt-1">Our engine rejects multi-day experiences exceeding your stay duration.</p>
          </div>

          <div className="max-w-md space-y-6">
            <div className="flex items-center space-x-4">
              <input
                type="number"
                min="1"
                max="14"
                value={formData.durationDays}
                onChange={(e) => setFormData({ ...formData, durationDays: Math.max(1, Math.min(14, parseInt(e.target.value) || 1)) })}
                className="w-28 text-center text-3xl font-extrabold text-slate-900 border-2 border-slate-200 rounded-2xl py-3 focus:outline-none focus:border-rose-600 bg-white shadow-inner"
              />
              <span className="font-extrabold text-lg text-slate-700">Days</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {[2, 3, 4, 5, 7, 10].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setFormData({ ...formData, durationDays: d })}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    formData.durationDays === d
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {d} Days
                </button>
              ))}
            </div>

            <p className="text-xs text-slate-500 bg-slate-100/70 p-3 rounded-xl border border-slate-200">
              <Info className="w-3.5 h-3.5 inline mr-1 text-slate-600" />
              For stays under 3 days, composition prioritizes the Rīga Gateway (R0-R3) and nearby Jurmala/Sigulda corridors. Stays of 4+ days unlock deep regional routes (Māra Road, Jacob Road).
            </p>
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-100">
            <button
              onClick={() => setCurrentStep(2)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              Back
            </button>
            <button
              onClick={() => setCurrentStep(4)}
              className="inline-flex items-center space-x-1.5 px-6 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors"
            >
              <span>Next: Season</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: What Season? */}
      {currentStep === 4 && (
        <div className="space-y-6 glass-panel p-6 sm:p-10 rounded-3xl animate-fadeIn">
          <div>
            <span className="text-xs font-bold text-rose-700 tracking-wider uppercase">Question 4</span>
            <h2 className="text-2xl font-extrabold text-slate-900 mt-1">What season are you visiting?</h2>
            <p className="text-xs text-slate-500 mt-1">Latvia experiences 4 distinct seasonal lenses with strict physical conditions.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {SEASONS.map((s) => {
              const selected = formData.season === s.value;
              const Icon = s.icon;
              return (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, season: s.value })}
                  className={`text-left p-5 rounded-2xl border transition-all ${
                    selected
                      ? 'border-rose-600 bg-rose-50/70 shadow-sm ring-1 ring-rose-500'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div className={`p-2 rounded-xl border ${s.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="font-extrabold text-base text-slate-900">{s.label}</span>
                        <span className="text-[11px] font-bold text-rose-700 ml-2">({s.lens})</span>
                      </div>
                    </div>
                    {selected && <CheckCircle2 className="w-5 h-5 text-rose-600 flex-shrink-0" />}
                  </div>
                  <p className="text-xs text-slate-600 mt-3 leading-relaxed">{s.desc}</p>
                </button>
              );
            })}
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-100">
            <button
              onClick={() => setCurrentStep(3)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              Back
            </button>
            <button
              onClick={() => setCurrentStep(5)}
              className="inline-flex items-center space-x-1.5 px-6 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors"
            >
              <span>Next: Interests</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: Interests Most */}
      {currentStep === 5 && (
        <div className="space-y-6 glass-panel p-6 sm:p-10 rounded-3xl animate-fadeIn">
          <div>
            <span className="text-xs font-bold text-rose-700 tracking-wider uppercase">Question 5</span>
            <h2 className="text-2xl font-extrabold text-slate-900 mt-1">What interests you most?</h2>
            <p className="text-xs text-slate-500 mt-1">Select all that apply. These weight our route recommendation logic.</p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {INTERESTS_LIST.map((interest) => {
              const active = formData.selectedInterests.includes(interest);
              return (
                <button
                  key={interest}
                  type="button"
                  onClick={() => toggleInterest(interest)}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all border ${
                    active
                      ? 'bg-rose-600 text-white border-rose-600 shadow-md scale-105'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {interest}
                </button>
              );
            })}
          </div>

          <div className="text-xs text-slate-500 pt-2">
            Selected: <span className="font-bold text-slate-800">{formData.selectedInterests.join(', ') || 'None selected'}</span>
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-100">
            <button
              onClick={() => setCurrentStep(4)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              Back
            </button>
            <button
              onClick={() => setCurrentStep(6)}
              className="inline-flex items-center space-x-1.5 px-6 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors"
            >
              <span>Next: Budget</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 6: Budget Tier */}
      {currentStep === 6 && (
        <div className="space-y-6 glass-panel p-6 sm:p-10 rounded-3xl animate-fadeIn">
          <div>
            <span className="text-xs font-bold text-rose-700 tracking-wider uppercase">Question 6 (Optional)</span>
            <h2 className="text-2xl font-extrabold text-slate-900 mt-1">What is your desired budget tier?</h2>
            <p className="text-xs text-slate-500 mt-1">Helps align accommodation and private versus grouped experiences.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {BUDGET_OPTIONS.map((item) => {
              const selected = formData.budgetLevel === item.value;
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, budgetLevel: item.value })}
                  className={`text-left p-4 rounded-2xl border transition-all ${
                    selected
                      ? 'border-rose-600 bg-rose-50/70 shadow-sm ring-1 ring-rose-500'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900">{item.label}</span>
                    {selected && <CheckCircle2 className="w-4 h-4 text-rose-600 flex-shrink-0" />}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
                </button>
              );
            })}
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-100">
            <button
              onClick={() => setCurrentStep(5)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              Back
            </button>
            <button
              onClick={() => setCurrentStep(7)}
              className="inline-flex items-center space-x-1.5 px-6 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors"
            >
              <span>Next: Special Needs & Compose</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 7: Special Needs & Traveler Details */}
      {currentStep === 7 && (
        <div className="space-y-6 glass-panel p-6 sm:p-10 rounded-3xl animate-fadeIn">
          <div>
            <span className="text-xs font-bold text-rose-700 tracking-wider uppercase">Question 7 & Contact</span>
            <h2 className="text-2xl font-extrabold text-slate-900 mt-1">Any special needs or non-negotiables?</h2>
            <p className="text-xs text-slate-500 mt-1">
              Accessibility, dietary requirements, elderly family members, privacy preferences.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Special Needs / Requests (Textarea)
              </label>
              <textarea
                rows={3}
                placeholder="Examples: Barrier-free wheelchair accessibility, vegan / gluten-free dining, travelling with toddlers, high privacy for meetings..."
                value={formData.specialNeeds}
                onChange={(e) => setFormData({ ...formData, specialNeeds: e.target.value })}
                className="w-full text-xs p-3 rounded-2xl border border-slate-200 focus:outline-none focus:border-rose-600 bg-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Your Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maria Ozola"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-rose-600 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. maria@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-rose-600 bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number (Optional)</label>
              <input
                type="tel"
                placeholder="+371 20000000"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-rose-600 bg-white"
              />
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-800 text-xs border border-rose-200 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            {isComposing && (
              <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 space-y-3 animate-pulse">
                <div className="flex items-center space-x-2 text-amber-900 font-extrabold text-sm">
                  <Sparkles className="w-4 h-4 text-amber-600 animate-spin" />
                  <span>AI Journey Composer in Progress...</span>
                </div>
                <p className="text-xs text-amber-800 font-medium">
                  {compositionStateMsg || 'Synthesizing your personalized Latvia experience...'}
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-100">
            <button
              onClick={() => setCurrentStep(6)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              Back
            </button>
            <button
              onClick={handleCompose}
              disabled={isComposing}
              className="inline-flex items-center space-x-2 px-7 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 text-slate-950 font-extrabold text-xs shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>Compose My Latvia Journey</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 8: COMPOSED JOURNEY RESULT VIEW */}
      {currentStep === 8 && composedJourney && (
        <div className="space-y-8 animate-fadeIn">
          {/* Header Card */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 space-y-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center space-x-2">
                <span className="text-xs px-2.5 py-1 rounded-full bg-slate-900 text-white font-bold uppercase tracking-wider">
                  {composedJourney.primaryRoute.replace('_', ' ')}
                </span>
                <span className="text-xs px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-semibold border border-amber-300">
                  {composedJourney.season} Season
                </span>
                <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-semibold border border-slate-300">
                  {composedJourney.totalDays} Days
                </span>
              </div>

              {/* Human Validation Status Pill */}
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold text-slate-500">Status:</span>
                <span className={`text-xs px-3 py-1 rounded-full font-bold uppercase border ${
                  composedJourney.status === 'APPROVED'
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : composedJourney.status === 'OPS_REVIEW'
                    ? 'bg-blue-100 text-blue-800 border-blue-300 animate-pulse'
                    : 'bg-amber-100 text-amber-900 border-amber-300'
                }`}>
                  {composedJourney.status}
                </span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-snug">
              {composedJourney.title}
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">
              {composedJourney.summary}
            </p>

            {/* AI EXPLAINABILITY LAYER ("Why this was recommended") */}
            <div className="p-5 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-2 mt-4">
              <div className="flex items-center space-x-2 text-amber-900 font-bold text-xs uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-amber-700" />
                <span>AI Rationale &bull; Why This Was Recommended</span>
              </div>
              <p className="text-xs text-amber-950 font-medium leading-relaxed">
                &ldquo;{composedJourney.aiRationale}&rdquo;
              </p>
            </div>
          </div>

          {/* Quick Summary Cards: Hotel, Activities, Food, Transport, Budget */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Suggested Hotel */}
            <div className="p-5 rounded-2xl glass-panel space-y-2 border border-slate-200">
              <div className="flex items-center space-x-2 text-slate-900 font-bold text-xs">
                <Hotel className="w-4 h-4 text-rose-700" />
                <span>Suggested Hotel</span>
              </div>
              <div className="font-extrabold text-sm text-slate-900">
                {composedJourney.suggestedHotel?.supplierName}
              </div>
              <div className="text-[11px] text-slate-500">
                {composedJourney.suggestedHotel?.location} &bull; {composedJourney.suggestedHotel?.priceRange}
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed pt-1">
                {composedJourney.suggestedHotel?.whyRecommended}
              </p>
            </div>

            {/* Food Experiences */}
            <div className="p-5 rounded-2xl glass-panel space-y-2 border border-slate-200">
              <div className="flex items-center space-x-2 text-slate-900 font-bold text-xs">
                <Utensils className="w-4 h-4 text-amber-600" />
                <span>Curated Dining</span>
              </div>
              <ul className="text-xs text-slate-800 space-y-1 font-semibold">
                {composedJourney.foodExperiences?.map((f: string, i: number) => (
                  <li key={i} className="flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Transport */}
            <div className="p-5 rounded-2xl glass-panel space-y-2 border border-slate-200">
              <div className="flex items-center space-x-2 text-slate-900 font-bold text-xs">
                <Car className="w-4 h-4 text-indigo-700" />
                <span>Seamless Transport</span>
              </div>
              <div className="font-extrabold text-sm text-slate-900">
                {composedJourney.transport?.type}
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed pt-1">
                {composedJourney.transport?.whyRecommended}
              </p>
            </div>

            {/* Estimated Budget */}
            <div className="p-5 rounded-2xl glass-panel space-y-2 border border-slate-200 bg-gradient-to-br from-white to-slate-50">
              <div className="flex items-center space-x-2 text-slate-900 font-bold text-xs">
                <Coins className="w-4 h-4 text-emerald-600" />
                <span>Estimated Budget</span>
              </div>
              <div className="text-2xl font-black text-slate-900">
                &euro;{composedJourney.estimatedBudgetEur}
              </div>
              <div className="text-[11px] text-slate-500 font-medium">
                Indicative total for {composedJourney.totalDays} days ({composedJourney.budgetTier} tier).
              </div>
              <div className="text-[10px] text-rose-700 font-semibold">
                Subject to Prime Assist operator slot audit.
              </div>
            </div>
          </div>

          {/* DAY BY DAY PLAN */}
          <div className="space-y-4">
            <h2 className="text-xl font-extrabold text-slate-900">Daily Execution Plan</h2>
            <div className="space-y-4">
              {composedJourney.dailyPlan?.map((day: any) => (
                <div key={day.dayNumber} className="glass-panel p-6 rounded-3xl border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center space-x-3">
                      <span className="w-8 h-8 rounded-xl bg-slate-900 text-white font-extrabold text-xs flex items-center justify-center">
                        D{day.dayNumber}
                      </span>
                      <div>
                        <h3 className="font-extrabold text-base text-slate-900">Day {day.dayNumber}</h3>
                        <p className="text-xs text-rose-800 font-semibold">{day.theme}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-1">
                    {day.slots.map((slot: any, idx: number) => (
                      <div key={idx} className="p-4 rounded-2xl bg-white border border-slate-100 space-y-2 shadow-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                            {slot.timeSlot}
                          </span>
                          <span className="text-xs font-bold text-slate-900">
                            {slot.priceEur > 0 ? `€${slot.priceEur}` : 'Included'}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-slate-900 leading-snug">{slot.moduleTitle}</h4>
                        <p className="text-xs text-slate-500">{slot.supplierName} &bull; {slot.locationName}</p>
                        <div className="text-[11px] text-amber-900 bg-amber-50/70 p-2 rounded-xl border border-amber-100 leading-relaxed">
                          <span className="font-bold">Why: </span>{slot.whyRecommended}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* HUMAN VALIDATION CTA BOX */}
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white space-y-4 shadow-xl">
            <div className="flex items-center space-x-2 text-rose-400 font-bold text-xs uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-rose-400" />
              <span>Human Validation Gate</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold">Ready to validate this draft with an operator?</h3>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              In accordance with our core principle, this journey is currently in <strong className="text-white">DRAFT</strong>. 
              Click below to submit to Prime Assist Operations Desk. An inbound specialist will verify real supplier slots, check winter/road safety, and provide a binding confirmation.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={handleSubmitReview}
                disabled={submittedToReview || composedJourney.status === 'OPS_REVIEW'}
                className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-extrabold text-xs shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {submittedToReview || composedJourney.status === 'OPS_REVIEW'
                    ? 'Submitted to Prime Assist Desk ✓'
                    : 'Submit for Human Operator Validation'}
                </span>
              </button>

              <button
                onClick={() => setCurrentStep(1)}
                className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors"
              >
                Start New Questionnaire
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
