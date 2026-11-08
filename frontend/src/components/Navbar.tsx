'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, MapPin, Building2, ShieldCheck, User as UserIcon, LogOut, Sparkles } from 'lucide-react';
import { authApi } from '../services/api';

export default function Navbar() {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('eximia_user');
      if (stored) {
        try {
          setUser(JSON.parse(stored));
        } catch {
          // ignore
        }
      }
    }
  }, [pathname]);

  const handleLogout = () => {
    authApi.logout();
    setUser(null);
    window.location.href = '/login';
  };

  const navLinks = [
    { href: '/', label: 'Journey Composer', icon: Compass },
    { href: '/routes', label: '7 Routes of Latvia', icon: MapPin },
    { href: '/suppliers', label: 'Supplier Portal', icon: Building2 },
    { href: '/admin', label: 'Human Validation Desk', icon: ShieldCheck },
  ];

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-200/80 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-600 via-rose-700 to-indigo-900 flex items-center justify-center text-white shadow-md shadow-rose-900/20 group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5 text-amber-200" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center space-x-1.5">
                  <span className="font-extrabold text-lg tracking-wider text-slate-900">EXIMIA</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold border border-amber-300/60">
                    LATVIA
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 font-medium tracking-tight">
                  Journey Composer Platform
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-rose-50 text-rose-800 border border-rose-200/70 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-rose-700' : 'text-slate-400'}`} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Action / Principle & Auth */}
          <div className="flex items-center space-x-3">
            <div className="hidden lg:flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-100 text-[11px] font-medium text-slate-600 border border-slate-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>&ldquo;AI composes. Humans validate.&rdquo;</span>
            </div>

            {user ? (
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
                  <UserIcon className="w-4 h-4 text-slate-500" />
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold text-slate-800 leading-none">{user.fullName || user.email}</span>
                    <span className="text-[10px] text-rose-700 font-semibold leading-tight">{user.role}</span>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  title="Sign out"
                  className="p-2 text-slate-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center space-x-1.5 text-xs font-bold px-3 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-sm"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>Operator Sign In</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
