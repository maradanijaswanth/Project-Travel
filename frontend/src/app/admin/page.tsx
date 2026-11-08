'use client';

import React, { useEffect, useState } from 'react';
import { 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  UserCheck, 
  AlertTriangle, 
  ChevronRight, 
  ExternalLink,
  Coins,
  Calendar,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';
import { journeyApi, customerApi, knowledgeApi } from '../../services/api';

export default function AdminDashboardPage() {
  const [journeys, setJourneys] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedJourney, setSelectedJourney] = useState<any>(null);
  const [showValidationModal, setShowValidationModal] = useState<boolean>(false);

  // Validation Form State
  const [validationData, setValidationData] = useState({
    decision: 'APPROVED' as 'APPROVED' | 'REJECTED' | 'CONFIRMED',
    comments: '',
    slotChecked: true,
    pricingChecked: true,
    safetyChecked: true,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [journeysRes, customersRes, statsRes] = await Promise.all([
        journeyApi.list(),
        customerApi.list(),
        knowledgeApi.getStats(),
      ]);

      if (journeysRes.success) setJourneys(journeysRes.data);
      if (customersRes.success) setCustomers(customersRes.data);
      if (statsRes.success) setStats(statsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenValidation = async (journeyId: string) => {
    try {
      const res = await journeyApi.getById(journeyId);
      if (res.success) {
        setSelectedJourney(res.data);
        setShowValidationModal(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleExecuteValidation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJourney) return;

    try {
      const res = await journeyApi.validate(selectedJourney.journey_id, validationData);
      if (res.success) {
        setShowValidationModal(false);
        fetchData();
        // Refresh selected journey details
        const refreshed = await journeyApi.getById(selectedJourney.journey_id);
        if (refreshed.success) setSelectedJourney(refreshed.data);
      } else {
        alert(res.error || 'Failed to submit validation');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">CONFIRMED</span>;
      case 'APPROVED':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-teal-100 text-teal-800 border border-teal-300">APPROVED BY OPS</span>;
      case 'OPS_REVIEW':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-800 border border-blue-300 animate-pulse">OPS REVIEW REQUIRED</span>;
      case 'REJECTED':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-800 border border-rose-300">REJECTED</span>;
      case 'DRAFT':
      default:
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-300">AI DRAFT</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-bold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>HUMAN OPERATOR DESK (PRIME ASSIST)</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900">
          Journey Validation & Operations Dashboard
        </h1>
        <p className="text-xs text-slate-500 max-w-2xl">
          Core Principle: <strong>&ldquo;AI composes. Humans validate.&rdquo;</strong> No journey confirms directly. Operators verify live supplier slot availability, capacity, safety, and price logic.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl glass-panel border border-slate-200">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Ops Review</div>
          <div className="text-3xl font-black text-blue-600 mt-1">
            {stats?.journeyStatusDistribution?.OPS_REVIEW || journeys.filter(j => j.status === 'OPS_REVIEW').length}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Require human verification</div>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-slate-200">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Approved Journeys</div>
          <div className="text-3xl font-black text-teal-600 mt-1">
            {stats?.journeyStatusDistribution?.APPROVED || journeys.filter(j => j.status === 'APPROVED').length}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Ready for traveller confirmation</div>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-slate-200">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Confirmed Bookings</div>
          <div className="text-3xl font-black text-emerald-600 mt-1">
            {stats?.journeyStatusDistribution?.CONFIRMED || journeys.filter(j => j.status === 'CONFIRMED').length}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Legally binding execution</div>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-slate-200">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Suppliers</div>
          <div className="text-3xl font-black text-slate-900 mt-1">
            {stats?.totals?.suppliers || 14}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">15 Experience Modules (M0-M4)</div>
        </div>
      </div>

      {/* Human Validation Queue */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center space-x-2">
            <Clock className="w-5 h-5 text-rose-700" />
            <span>Human Validation Workflow Queue</span>
          </h2>
          <span className="text-xs font-semibold text-slate-500">
            {journeys.length} total customer compositions
          </span>
        </div>

        <div className="glass-panel rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Journey Title</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Route</th>
                  <th className="py-3.5 px-4">Season</th>
                  <th className="py-3.5 px-4">Budget</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Created</th>
                  <th className="py-3.5 px-4 text-right">Human Review Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {journeys.map((j) => (
                  <tr key={j.journey_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900 max-w-[240px]">
                      <div className="truncate">{j.title}</div>
                      <div className="text-[10px] text-slate-400 font-normal">
                        {j.total_days} Days &bull; AI Conf: {Math.round(j.ai_confidence_score * 100)}%
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{j.customer?.full_name || 'Anonymous'}</div>
                      <div className="text-[10px] text-slate-500">{j.customer?.email}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold">{j.primary_route?.replace('_', ' ')}</span>
                    </td>
                    <td className="py-3.5 px-4">{j.season}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      &euro;{j.estimated_budget_eur}
                    </td>
                    <td className="py-3.5 px-4">
                      {getStatusBadge(j.status)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                      {new Date(j.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleOpenValidation(j.journey_id)}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-colors ${
                          j.status === 'OPS_REVIEW'
                            ? 'bg-rose-700 hover:bg-rose-800 text-white shadow-sm'
                            : 'bg-slate-900 hover:bg-slate-800 text-white'
                        }`}
                      >
                        {j.status === 'OPS_REVIEW' ? 'Audit & Validate' : 'Inspect Journey'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Customer Questionnaire Requests Table */}
      <div className="space-y-4 pt-4">
        <h2 className="text-xl font-extrabold text-slate-900 flex items-center space-x-2">
          <FileText className="w-5 h-5 text-indigo-600" />
          <span>Customer Intent Database Records</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {customers.map((c) => {
            let interests: string[] = [];
            try {
              interests = JSON.parse(c.selected_interests);
            } catch {
              interests = [];
            }
            return (
              <div key={c.customer_id} className="p-5 rounded-2xl glass-panel border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900">{c.full_name}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
                    {c.traveller_type}
                  </span>
                </div>
                <div className="text-xs text-slate-500">{c.email} &bull; {c.phone || 'No phone'}</div>
                
                <div className="space-y-1 text-xs">
                  <div><strong>Purpose:</strong> {c.trip_purpose}</div>
                  <div><strong>Duration & Season:</strong> {c.duration_days} Days ({c.season})</div>
                  <div><strong>Budget:</strong> {c.budget_level}</div>
                  {c.special_needs && (
                    <div className="text-rose-800 bg-rose-50 p-2 rounded-lg border border-rose-100 text-[11px]">
                      <strong>Special Needs:</strong> {c.special_needs}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-1 pt-1">
                  {interests.map((it, idx) => (
                    <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                      {it}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* OPERATOR VALIDATION MODAL */}
      {showValidationModal && selectedJourney && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 animate-fadeIn">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-slate-500 uppercase">Human Operator Review</span>
                  {getStatusBadge(selectedJourney.status)}
                </div>
                <h2 className="text-2xl font-extrabold text-slate-900 mt-1">{selectedJourney.title}</h2>
                <p className="text-xs text-slate-500">
                  Customer: {selectedJourney.customer?.full_name} ({selectedJourney.customer?.email}) &bull; {selectedJourney.total_days} Days &bull; {selectedJourney.season}
                </p>
              </div>
              <button
                onClick={() => setShowValidationModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold p-1"
              >
                &times;
              </button>
            </div>

            {/* AI Rationale Display */}
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs space-y-1">
              <div className="font-extrabold text-amber-900 uppercase text-[10px]">AI Composition Rationale:</div>
              <p className="text-amber-950">{selectedJourney.ai_rationale}</p>
            </div>

            {/* Itinerary Slots Breakdown */}
            <div className="space-y-3">
              <h3 className="font-extrabold text-sm text-slate-900">Itinerary Slots for Human Verification:</h3>
              <div className="space-y-2">
                {selectedJourney.itineraries?.map((it: any) => (
                  <div key={it.itinerary_id} className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-xs flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900">Day {it.day_number} &bull; {it.time_slot}: </span>
                      <span>{it.custom_title || it.module?.title}</span>
                      <div className="text-[11px] text-slate-500">
                        Supplier: {it.module?.supplier?.name} &bull; {it.module?.location_name}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-slate-900">&euro;{it.module?.indicative_price_eur}</span>
                      <div className="text-[10px] text-teal-700 font-semibold">{it.module?.maturity_level}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Operational Sign-Off Form */}
            <form onSubmit={handleExecuteValidation} className="space-y-4 pt-4 border-t border-slate-100">
              <h3 className="font-extrabold text-sm text-slate-900">Operator Verification Checklist:</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label className="flex items-center space-x-2 text-xs font-bold text-slate-700 p-3 rounded-xl border border-slate-200 bg-white cursor-pointer hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={validationData.slotChecked}
                    onChange={(e) => setValidationData({ ...validationData, slotChecked: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <span>Supplier Slot Verified</span>
                </label>

                <label className="flex items-center space-x-2 text-xs font-bold text-slate-700 p-3 rounded-xl border border-slate-200 bg-white cursor-pointer hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={validationData.pricingChecked}
                    onChange={(e) => setValidationData({ ...validationData, pricingChecked: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <span>Net Price & Margin Verified</span>
                </label>

                <label className="flex items-center space-x-2 text-xs font-bold text-slate-700 p-3 rounded-xl border border-slate-200 bg-white cursor-pointer hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={validationData.safetyChecked}
                    onChange={(e) => setValidationData({ ...validationData, safetyChecked: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <span>Seasonal Safety Confirmed</span>
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Operator Notes & Justification</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Notes on confirmed room allocations, guide names, vehicle dispatch, or cancellation contingency..."
                  value={validationData.comments}
                  onChange={(e) => setValidationData({ ...validationData, comments: e.target.value })}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-rose-600"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setValidationData({ ...validationData, decision: 'APPROVED' })}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      validationData.decision === 'APPROVED'
                        ? 'bg-teal-600 text-white shadow'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    Action: Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => setValidationData({ ...validationData, decision: 'CONFIRMED' })}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      validationData.decision === 'CONFIRMED'
                        ? 'bg-emerald-600 text-white shadow'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    Action: Final Confirm
                  </button>
                  <button
                    type="button"
                    onClick={() => setValidationData({ ...validationData, decision: 'REJECTED' })}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      validationData.decision === 'REJECTED'
                        ? 'bg-rose-600 text-white shadow'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    Action: Reject
                  </button>
                </div>

                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowValidationModal(false)}
                    className="px-4 py-2 rounded-xl text-slate-600 font-semibold text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs shadow-md transition-colors"
                  >
                    Execute Validation Record
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
