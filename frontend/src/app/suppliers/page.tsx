'use client';

import React, { useEffect, useState } from 'react';
import { 
  Building2, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  Filter, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Tag, 
  MapPin, 
  Users, 
  ExternalLink,
  ChevronDown,
  Layers,
  Sparkles
} from 'lucide-react';
import { supplierApi } from '../../services/api';

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [maturityFilter, setMaturityFilter] = useState<string>('');
  const [seasonFilter, setSeasonFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected supplier for detail modal / drawer
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null);
  const [showAddSupplierModal, setShowAddSupplierModal] = useState<boolean>(false);
  const [showAddModuleModal, setShowAddModuleModal] = useState<boolean>(false);
  const [showAddCapabilityModal, setShowAddCapabilityModal] = useState<boolean>(false);

  // Form states
  const [newSupplier, setNewSupplier] = useState({
    name: '',
    category: 'Activity',
    season: 'All',
    capacity: 20,
    price_range: 'Standard',
    location: '',
    status: 'ACTIVE',
    maturity_level: 'M2',
    description: '',
    contact_name: '',
    contact_email: '',
  });

  const [newModule, setNewModule] = useState({
    title: '',
    description: '',
    category: 'Activity',
    route_code: 'RIGA_GATEWAY',
    seasonal_lens: 'Expansion',
    seasons_supported: ['Spring', 'Summer', 'Autumn', 'Winter'],
    target_segments: ['Cultural Explorers', 'Families'],
    duration_hours: 2.5,
    indicative_price_eur: 60.0,
    price_tier: 'Standard',
    location_name: '',
    maturity_level: 'M3',
    provenance: 'APPROVED_COMMERCIAL',
  });

  const [newCapability, setNewCapability] = useState({
    name: '',
    category: 'Craftsmanship',
    participation_mode: 'Interact',
    is_winter_capable: true,
    is_private_group_feasible: true,
    min_capacity: 2,
    max_capacity: 20,
    operating_boundaries: '',
  });

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const res = await supplierApi.list({
        category: categoryFilter || undefined,
        maturity: maturityFilter || undefined,
        season: seasonFilter || undefined,
        search: searchQuery || undefined,
      });
      if (res.success) {
        setSuppliers(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, [categoryFilter, maturityFilter, seasonFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchSuppliers();
  };

  const handleCreateSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await supplierApi.create(newSupplier);
      if (res.success) {
        setShowAddSupplierModal(false);
        fetchSuppliers();
      } else {
        alert(res.error || 'Failed to create supplier');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMaturityChange = async (supplierId: string, newMaturity: string) => {
    try {
      const res = await supplierApi.update(supplierId, { maturity_level: newMaturity });
      if (res.success) {
        fetchSuppliers();
        if (selectedSupplier && selectedSupplier.supplier_id === supplierId) {
          setSelectedSupplier({ ...selectedSupplier, maturity_level: newMaturity });
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleModuleMaturityChange = async (moduleId: string, newMaturity: string) => {
    try {
      const res = await supplierApi.updateModule(moduleId, { maturity_level: newMaturity });
      if (res.success) {
        if (selectedSupplier) {
          const updatedModules = selectedSupplier.modules.map((m: any) =>
            m.module_id === moduleId ? { ...m, maturity_level: newMaturity } : m
          );
          setSelectedSupplier({ ...selectedSupplier, modules: updatedModules });
        }
        fetchSuppliers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplier) return;
    try {
      const res = await supplierApi.addModule(selectedSupplier.supplier_id, {
        ...newModule,
        location_name: newModule.location_name || selectedSupplier.location,
      });
      if (res.success) {
        setShowAddModuleModal(false);
        const refreshed = await supplierApi.getById(selectedSupplier.supplier_id);
        if (refreshed.success) setSelectedSupplier(refreshed.data);
        fetchSuppliers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddCapability = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplier) return;
    try {
      const res = await supplierApi.addCapability(selectedSupplier.supplier_id, newCapability);
      if (res.success) {
        setShowAddCapabilityModal(false);
        const refreshed = await supplierApi.getById(selectedSupplier.supplier_id);
        if (refreshed.success) setSelectedSupplier(refreshed.data);
        fetchSuppliers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getMaturityBadge = (maturity: string) => {
    switch (maturity) {
      case 'M4':
        return <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">M4 Delivered & Tested</span>;
      case 'M3':
        return <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-teal-100 text-teal-800 border border-teal-300">M3 Commercially Validated (Customer Ready)</span>;
      case 'M2':
        return <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-300">M2 Structured Preview (Internal Only)</span>;
      case 'M1':
        return <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-blue-100 text-blue-800 border border-blue-300">M1 Basic Supplier Verified</span>;
      case 'M0':
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-slate-100 text-slate-700 border border-slate-300">M0 Discovered</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-bold">
            <Building2 className="w-3.5 h-3.5" />
            <span>TERRITORIAL CAPABILITY GRAPH</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900">
            Latvia Supplier Management Portal
          </h1>
          <p className="text-xs text-slate-500 max-w-2xl">
            Manage verified suppliers, operational capabilities, and discrete Experience Node Passports across maturity gates M0 to M4.
          </p>
        </div>

        <div>
          <button
            onClick={() => setShowAddSupplierModal(true)}
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs shadow-md transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Latvia Supplier</span>
          </button>
        </div>
      </div>

      {/* MATURITY GATE BANNER */}
      <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-950">
        <div className="flex items-center space-x-2.5">
          <ShieldCheck className="w-5 h-5 text-amber-700 flex-shrink-0" />
          <div>
            <span className="font-extrabold">Module Maturity Rule: </span>
            <span>Only <strong className="underline">M3</strong> and <strong className="underline">M4</strong> modules are exposed to customers during AI composition. M0, M1, and M2 remain strictly internal for supplier co-development.</span>
          </div>
        </div>
        <div className="flex items-center space-x-1 font-mono text-[11px] text-amber-900">
          <span>Pipeline: M0 &rarr; M1 &rarr; M2 &rarr; </span>
          <span className="font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">M3 &rarr; M4</span>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 min-w-[260px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search suppliers by name, location, or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-rose-600 bg-white"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs py-2 px-3 rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none"
          >
            <option value="">All Categories</option>
            <option value="Hotel">Hotels</option>
            <option value="Restaurant">Restaurants</option>
            <option value="Activity">Activities</option>
            <option value="Transport">Transport</option>
          </select>

          {/* Maturity Filter */}
          <select
            value={maturityFilter}
            onChange={(e) => setMaturityFilter(e.target.value)}
            className="text-xs py-2 px-3 rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none"
          >
            <option value="">All Maturity Levels</option>
            <option value="M4">M4 (Delivered & Measured)</option>
            <option value="M3">M3 (Commercially Validated)</option>
            <option value="M2">M2 (Structured Preview)</option>
            <option value="M1">M1 (Basic Supplier)</option>
            <option value="M0">M0 (Discovered)</option>
          </select>

          {/* Season Filter */}
          <select
            value={seasonFilter}
            onChange={(e) => setSeasonFilter(e.target.value)}
            className="text-xs py-2 px-3 rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none"
          >
            <option value="">All Seasons</option>
            <option value="Spring">Spring</option>
            <option value="Summer">Summer</option>
            <option value="Autumn">Autumn</option>
            <option value="Winter">Winter</option>
          </select>

          <button
            onClick={fetchSuppliers}
            className="text-xs px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Suppliers Table */}
      <div className="glass-panel rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Supplier Name</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Location</th>
                <th className="py-3.5 px-4">Season</th>
                <th className="py-3.5 px-4">Capacity</th>
                <th className="py-3.5 px-4">Price Range</th>
                <th className="py-3.5 px-4">Maturity Level</th>
                <th className="py-3.5 px-4">Modules</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={9} className="text-center py-10 text-slate-400">
                    Loading suppliers...
                  </td>
                </tr>
              ) : suppliers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-10 text-slate-400">
                    No suppliers matched your search criteria.
                  </td>
                </tr>
              ) : (
                suppliers.map((s) => (
                  <tr key={s.supplier_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <div className="flex flex-col">
                        <span>{s.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          ID: {s.supplier_id.slice(0, 8)}...
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-800">
                        {s.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                        <span className="truncate max-w-[150px]">{s.location}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">{s.season}</td>
                    <td className="py-3.5 px-4 font-semibold">{s.capacity} guests</td>
                    <td className="py-3.5 px-4">{s.price_range}</td>
                    <td className="py-3.5 px-4">
                      <select
                        value={s.maturity_level}
                        onChange={(e) => handleMaturityChange(s.supplier_id, e.target.value)}
                        className="text-[11px] font-bold p-1 rounded border border-slate-200 bg-white"
                      >
                        <option value="M0">M0 Discovered</option>
                        <option value="M1">M1 Basic</option>
                        <option value="M2">M2 Preview</option>
                        <option value="M3">M3 Validated (Ready)</option>
                        <option value="M4">M4 Delivered</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900">{s.modules?.length || 0}</span>
                      <span className="text-[10px] text-slate-400 ml-1">
                        ({s.modules?.filter((m: any) => ['M3', 'M4'].includes(m.maturity_level)).length || 0} live)
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedSupplier(s)}
                        className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold transition-colors"
                      >
                        Inspect & Passports
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL MODAL / DRAWER FOR SELECTED SUPPLIER */}
      {selectedSupplier && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 animate-fadeIn">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 font-bold uppercase">
                    {selectedSupplier.category}
                  </span>
                  {getMaturityBadge(selectedSupplier.maturity_level)}
                </div>
                <h2 className="text-2xl font-extrabold text-slate-900 mt-1">{selectedSupplier.name}</h2>
                <p className="text-xs text-slate-500">{selectedSupplier.location} &bull; Capacity: {selectedSupplier.capacity} guests</p>
              </div>
              <button
                onClick={() => setSelectedSupplier(null)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold p-1"
              >
                &times;
              </button>
            </div>

            {/* Description */}
            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
              {selectedSupplier.description || 'No detailed supplier description recorded.'}
            </p>

            {/* Capabilities Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-sm text-slate-900 flex items-center space-x-2">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  <span>Latent & Operational Capabilities ({selectedSupplier.capabilities?.length || 0})</span>
                </h3>
                <button
                  onClick={() => setShowAddCapabilityModal(true)}
                  className="text-xs font-bold text-rose-700 hover:underline flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Capability</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectedSupplier.capabilities?.map((c: any) => (
                  <div key={c.capability_id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900">{c.name}</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {c.participation_mode}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Capacity: {c.min_capacity}–{c.max_capacity} &bull; Winter Ready: {c.is_winter_capable ? 'Yes' : 'No'}
                    </div>
                    {c.operating_boundaries && (
                      <div className="text-[10px] text-slate-500 italic pt-1">
                        Boundaries: {c.operating_boundaries}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Experience Modules Section (Experience Node Passports) */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-sm text-slate-900 flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>Discrete Experience Modules ({selectedSupplier.modules?.length || 0})</span>
                </h3>
                <button
                  onClick={() => setShowAddModuleModal(true)}
                  className="text-xs font-bold text-rose-700 hover:underline flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Experience Passport</span>
                </button>
              </div>

              <div className="space-y-3">
                {selectedSupplier.modules?.map((m: any) => (
                  <div key={m.module_id} className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-slate-900">{m.title}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-slate-100 text-slate-700">
                          Route: {m.route_code}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded font-bold text-rose-800 bg-rose-50 border border-rose-200">
                          &euro;{m.indicative_price_eur} ({m.duration_hours}h)
                        </span>
                      </div>

                      {/* Maturity Toggle */}
                      <div className="flex items-center space-x-1">
                        <span className="text-[10px] font-semibold text-slate-500">Maturity:</span>
                        <select
                          value={m.maturity_level}
                          onChange={(e) => handleModuleMaturityChange(m.module_id, e.target.value)}
                          className="text-[10px] font-bold py-0.5 px-1.5 rounded border border-slate-200 bg-slate-50"
                        >
                          <option value="M0">M0 Discovered</option>
                          <option value="M1">M1 Basic</option>
                          <option value="M2">M2 Preview (Co-Design)</option>
                          <option value="M3">M3 Commercially Validated</option>
                          <option value="M4">M4 Delivered</option>
                        </select>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">{m.description}</p>

                    <div className="text-[11px] text-slate-500 flex flex-wrap gap-2 pt-1 border-t border-slate-50">
                      <span><strong>Provenance:</strong> {m.provenance}</span>
                      <span><strong>Requires Operator Quote:</strong> {m.requires_human_quote ? 'Yes' : 'No'}</span>
                      {m.evidence_notes && <span><strong>Evidence:</strong> {m.evidence_notes}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                onClick={() => setSelectedSupplier(null)}
                className="px-5 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 transition-colors"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE SUPPLIER MODAL */}
      {showAddSupplierModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreateSupplier} className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-lg text-slate-900">Add New Latvia Supplier</h3>
              <button type="button" onClick={() => setShowAddSupplierModal(false)} className="text-slate-400 font-bold text-lg">&times;</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Supplier Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Liepupe Manor Vidzeme"
                  value={newSupplier.name}
                  onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-rose-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category *</label>
                  <select
                    value={newSupplier.category}
                    onChange={(e) => setNewSupplier({ ...newSupplier, category: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none"
                  >
                    <option value="Hotel">Hotel</option>
                    <option value="Restaurant">Restaurant</option>
                    <option value="Activity">Activity</option>
                    <option value="Transport">Transport</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Season</label>
                  <select
                    value={newSupplier.season}
                    onChange={(e) => setNewSupplier({ ...newSupplier, season: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none"
                  >
                    <option value="All">All Season</option>
                    <option value="Spring">Spring</option>
                    <option value="Summer">Summer</option>
                    <option value="Autumn">Autumn</option>
                    <option value="Winter">Winter</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Capacity (Max guests)</label>
                  <input
                    type="number"
                    value={newSupplier.capacity}
                    onChange={(e) => setNewSupplier({ ...newSupplier, capacity: parseInt(e.target.value) || 1 })}
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Price Range</label>
                  <select
                    value={newSupplier.price_range}
                    onChange={(e) => setNewSupplier({ ...newSupplier, price_range: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none"
                  >
                    <option value="Budget">Budget</option>
                    <option value="Standard">Standard</option>
                    <option value="Premium">Premium</option>
                    <option value="Luxury">Luxury</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Location *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Liepupe, Limbaži parish, Vidzeme"
                  value={newSupplier.location}
                  onChange={(e) => setNewSupplier({ ...newSupplier, location: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Atmosphere, heritage background, facilities..."
                  value={newSupplier.description}
                  onChange={(e) => setNewSupplier({ ...newSupplier, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAddSupplierModal(false)}
                className="px-4 py-2 rounded-xl text-slate-600 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold"
              >
                Save Supplier
              </button>
            </div>
          </form>
        </div>
      )}

      {/* CREATE MODULE MODAL */}
      {showAddModuleModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleAddModule} className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-lg text-slate-900">Add Discrete Module (Passport)</h3>
              <button type="button" onClick={() => setShowAddModuleModal(false)} className="text-slate-400 font-bold text-lg">&times;</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Module Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Liepupe Manor Herb Garden Tea Ceremony"
                  value={newModule.title}
                  onChange={(e) => setNewModule({ ...newModule, title: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Route Alignment</label>
                  <select
                    value={newModule.route_code}
                    onChange={(e) => setNewModule({ ...newModule, route_code: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  >
                    <option value="LIVU">Līvu Road (Sea & Coast)</option>
                    <option value="DAUGAVA">Daugava Road (River & History)</option>
                    <option value="BALTIC_WAY">Baltic Way (Freedom)</option>
                    <option value="JACOB">Jacob Road (Trade & Craft)</option>
                    <option value="FREEDOM">Freedom Road (Statehood)</option>
                    <option value="LIGHT">Light Road (Education)</option>
                    <option value="MARA">Māra Road (Traditions & Food)</option>
                    <option value="RIGA_GATEWAY">Riga Gateway</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Initial Maturity</label>
                  <select
                    value={newModule.maturity_level}
                    onChange={(e) => setNewModule({ ...newModule, maturity_level: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  >
                    <option value="M2">M2 (Structured Co-Design)</option>
                    <option value="M3">M3 (Commercially Validated)</option>
                    <option value="M4">M4 (Delivered & Measured)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Duration (Hours)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={newModule.duration_hours}
                    onChange={(e) => setNewModule({ ...newModule, duration_hours: parseFloat(e.target.value) || 2 })}
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Indicative Price (EUR)</label>
                  <input
                    type="number"
                    value={newModule.indicative_price_eur}
                    onChange={(e) => setNewModule({ ...newModule, indicative_price_eur: parseFloat(e.target.value) || 50 })}
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Experience details, host participation, sensory encounters..."
                  value={newModule.description}
                  onChange={(e) => setNewModule({ ...newModule, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAddModuleModal(false)}
                className="px-4 py-2 rounded-xl text-slate-600 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold"
              >
                Save Module
              </button>
            </div>
          </form>
        </div>
      )}

      {/* CREATE CAPABILITY MODAL */}
      {showAddCapabilityModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleAddCapability} className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-lg text-slate-900">Add Supplier Capability</h3>
              <button type="button" onClick={() => setShowAddCapabilityModal(false)} className="text-slate-400 font-bold text-lg">&times;</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Capability Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Heated Wooden Greenhouse & Winter Botanical Tea Atelier"
                  value={newCapability.name}
                  onChange={(e) => setNewCapability({ ...newCapability, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Participation Mode</label>
                  <select
                    value={newCapability.participation_mode}
                    onChange={(e) => setNewCapability({ ...newCapability, participation_mode: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  >
                    <option value="Observe">Observe</option>
                    <option value="Interact">Interact</option>
                    <option value="Make">Make</option>
                    <option value="Perform">Perform</option>
                    <option value="Discuss">Discuss</option>
                    <option value="Move">Move</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Winter Capable?</label>
                  <select
                    value={newCapability.is_winter_capable ? 'yes' : 'no'}
                    onChange={(e) => setNewCapability({ ...newCapability, is_winter_capable: e.target.value === 'yes' })}
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  >
                    <option value="yes">Yes (Heated / Insulated)</option>
                    <option value="no">No (Warm Season Only)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Operating Boundaries / Constraints</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Max 15 people in private dining cellar; 48h advance reservation required for wood kiln."
                  value={newCapability.operating_boundaries}
                  onChange={(e) => setNewCapability({ ...newCapability, operating_boundaries: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAddCapabilityModal(false)}
                className="px-4 py-2 rounded-xl text-slate-600 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold"
              >
                Save Capability
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
