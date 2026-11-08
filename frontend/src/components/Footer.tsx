import React from 'react';
import Link from 'next/link';
import { Compass, ShieldCheck, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200/80 bg-white/70 backdrop-blur-md mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-lg text-slate-900">EXIMIA</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-semibold border border-rose-300">
                LATVIA
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Personalized Latvia Experience Orchestration Platform. 
              Connecting explicit human intent with verified territorial capabilities across 7 Meaning Routes and 4 Seasons.
            </p>
            <div className="text-[11px] font-semibold text-rose-700">
              Core Axiom: &ldquo;AI composes. Humans validate.&rdquo;
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Seven Routes of Latvia</h4>
            <ul className="space-y-1.5 text-xs text-slate-600">
              <li>Līvu Road (Sea & Maritime Heritage)</li>
              <li>Daugava Road (River of Destiny & Civilization)</li>
              <li>Baltic Way (Freedom & Unity)</li>
              <li>Jacob Road (Innovation & Courland Trade)</li>
              <li>Freedom Road (Statehood & Identity)</li>
              <li>Light Road (Knowledge & Folk Song Dainas)</li>
              <li>Māra Road (Traditions, Food & Black Pottery)</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Platform Navigation</h4>
            <ul className="space-y-1.5 text-xs text-slate-600">
              <li><Link href="/" className="hover:text-rose-700">Compose Your Journey</Link></li>
              <li><Link href="/routes" className="hover:text-rose-700">Explore Route Cartography</Link></li>
              <li><Link href="/suppliers" className="hover:text-rose-700">Supplier Capability Network (M0-M4)</Link></li>
              <li><Link href="/admin" className="hover:text-rose-700">Prime Assist Human Validation Desk</Link></li>
              <li><Link href="/login" className="hover:text-rose-700">Operator Access Portal</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Operational Framework</h4>
            <p className="text-xs text-slate-500 leading-relaxed mb-3">
              Operated in partnership with Prime Assist inbound operations. 
              Never directly confirms bookings without human verification of dates, capacity, safety, and net pricing.
            </p>
            <div className="flex items-center space-x-2 text-xs text-emerald-700 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>PTAC & EU Package Directive Compliant</span>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400">
          <span>&copy; {new Date().getFullYear()} EXIMIA Journey Composer. All rights reserved.</span>
          <span className="flex items-center space-x-1 mt-2 sm:mt-0">
            <span>Crafted with pride for authentic Latvia journeys</span>
            <Heart className="w-3 h-3 text-rose-600 inline fill-rose-600" />
          </span>
        </div>
      </div>
    </footer>
  );
}
