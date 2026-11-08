'use client';

import React, { useEffect, useState } from 'react';
import { Compass, MapPin, Waves, Sparkles, Sun, CloudSnow, Leaf, Flower2, ShieldAlert } from 'lucide-react';
import { knowledgeApi } from '../../services/api';

export default function RoutesPage() {
  const [routes, setRoutes] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [routesRes, statsRes] = await Promise.all([
          knowledgeApi.getRoutes(),
          knowledgeApi.getStats(),
        ]);
        if (routesRes.success) setRoutes(routesRes.data);
        if (statsRes.success) setStats(statsRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const seasonsList = [
    { name: 'Spring', lens: 'Awakening', icon: Flower2, color: 'text-emerald-700 bg-emerald-50 border-emerald-200', desc: 'Birch sap tapping, flooding meadows, migrating birds in Ķemeri, blooming cherry orchards.' },
    { name: 'Summer', lens: 'Expansion', icon: Sun, color: 'text-amber-700 bg-amber-50 border-amber-200', desc: 'White nights, Jāņi midsummer solstice fires, golden Baltic dunes, open-air choir acoustic stages.' },
    { name: 'Autumn', lens: 'Integration', icon: Leaf, color: 'text-orange-700 bg-orange-50 border-orange-200', desc: 'Amber foliage in Sigulda Gauja valley, primeval mushroom & lingonberry foraging, harvest banquets.' },
    { name: 'Winter', lens: 'Silence', icon: CloudSnow, color: 'text-blue-700 bg-blue-50 border-blue-200', desc: 'Snowshoe bog boardwalks, wood-fired black saunas, candlelit medieval cellar banquets, ice fishing.' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Page Header */}
      <div className="space-y-4 max-w-3xl">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-bold border border-rose-200">
          <MapPin className="w-3.5 h-3.5" />
          <span>KNOWLEDGE LAYER</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          The Seven Meaning Routes of Latvia
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          Latvia is structured through seven semantic meaning corridors and the central Rīga Gateway. 
          Each route embodies authentic regional identity, cultural memory, and physical landscape rather than superficial marketing pins.
        </p>
      </div>

      {/* Routes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {routes.map((route) => {
          const moduleCount = stats?.routeDistribution?.[route.code] || 0;
          return (
            <div
              key={route.code}
              className="glass-panel p-6 rounded-3xl border border-slate-200 hover:shadow-lg transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-slate-900 text-white tracking-wider">
                    {route.code.replace('_', ' ')}
                  </span>
                  <span className="text-xs font-bold text-slate-500">
                    {moduleCount} Verified Modules
                  </span>
                </div>

                <h3 className="text-xl font-extrabold text-slate-900">{route.name}</h3>

                <div className="flex flex-wrap gap-1.5">
                  {route.theme.map((t: string, i: number) => (
                    <span
                      key={i}
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {route.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-1.5">
                <div className="text-[11px] text-slate-500">
                  <span className="font-bold text-slate-700">Cultural Focus: </span>
                  {route.culturalFocus}
                </div>
                <div className="text-[11px] text-slate-500">
                  <span className="font-bold text-slate-700">Regions: </span>
                  {route.geographicRegions?.join(' &bull; ')}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Four Seasons Section */}
      <div className="space-y-6 pt-6">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold border border-amber-200">
            <Sun className="w-3.5 h-3.5" />
            <span>SEASONAL CALIBRATION</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900">
            Four Seasonal Lenses
          </h2>
          <p className="text-xs text-slate-600 max-w-2xl">
            In the EXIMIA system, seasonality is a hard physical condition, not an aesthetic tag. 
            Summer offers White Nights expansion; Winter commands silence, heated indoor spaces, and black sauna traditions.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {seasonsList.map((season) => {
            const Icon = season.icon;
            return (
              <div key={season.name} className="p-6 rounded-3xl glass-panel border border-slate-200 space-y-3">
                <div className="flex items-center space-x-3">
                  <div className={`p-2.5 rounded-xl border ${season.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-base text-slate-900">{season.name}</h4>
                    <span className="text-xs font-bold text-rose-700">{season.lens}</span>
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed pt-1">
                  {season.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
