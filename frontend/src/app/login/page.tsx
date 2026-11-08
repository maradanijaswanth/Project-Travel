'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Lock, Mail, ArrowRight, UserCheck, AlertCircle } from 'lucide-react';
import { authApi } from '../../services/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await authApi.login({ email, password });
      if (res.success && res.data) {
        localStorage.setItem('eximia_token', res.data.token);
        localStorage.setItem('eximia_user', JSON.stringify(res.data.user));
        router.push('/admin');
      } else {
        setErrorMsg(res.error || 'Authentication failed');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to connect to authentication service');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('Eximia2026!');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-6 animate-fadeIn">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-rose-700 text-white mx-auto flex items-center justify-center shadow-lg shadow-rose-900/20">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900">Operator Sign In</h1>
        <p className="text-xs text-slate-500">
          Role-Based Access for Prime Assist Inbound Operators & System Administrators.
        </p>
      </div>

      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5">
        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@primeassist.lv"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-rose-600 bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-rose-600 bg-white"
              />
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 text-rose-800 text-[11px] border border-rose-200 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In with JWT'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo Credentials */}
        <div className="pt-4 border-t border-slate-100 space-y-2">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">
            Instant Demo Sign-In
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('operator@primeassist.lv')}
              className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-left transition-colors"
            >
              <div className="font-bold text-[11px] text-slate-900">Operator Desk</div>
              <div className="text-[10px] text-slate-500">operator@primeassist.lv</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('admin@eximia.lv')}
              className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-left transition-colors"
            >
              <div className="font-bold text-[11px] text-slate-900">System Admin</div>
              <div className="text-[10px] text-slate-500">admin@eximia.lv</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
