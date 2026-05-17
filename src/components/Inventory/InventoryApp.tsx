import { useEffect, useMemo, useState } from 'react';
import { Download, Plus, Edit, Trash2, Search, Shield } from 'lucide-react';
import { v4 as uuid } from 'uuid';
import {
  listSystems,
  saveSystem,
  deleteSystem,
} from '../../lib/storage/localStorage';
import type { AISystem } from '../../lib/storage/schemas';
import { aiSystemSchema } from '../../lib/storage/schemas';
import { downloadInventoryExcel } from '../../lib/exports/inventoryExcel';
import { suggestEuAiActTier, suggestInternalRisk } from '../../lib/classifiers/eu-ai-act-classifier';

const today = () => new Date().toISOString().slice(0, 10);
const nextReview = (days: number) =>
  new Date(Date.now() + days * 86_400_000).toISOString().slice(0, 10);

const blank = (): AISystem => ({
  id: uuid(),
  name: '',
  businessOwner: '',
  technicalOwner: '',
  businessUnit: '',
  businessPurpose: '',
  status: 'Discovery',
  aiType: 'LLM',
  deploymentModel: 'SaaS API',
  buildVsBuy: 'Vendor product',
  trainingDataSources: '',
  inferenceInputs: '',
  inferenceOutputs: '',
  personalDataInvolved: false,
  personalDataCategories: [],
  euAiActTier: 'Unassessed',
  internalRiskTier: 'Moderate',
  classificationRationale: '',
  autonomyLevel: 'Suggest',
  humanOversight: '',
  vendor: '',
  dpaInPlace: false,
  modelProvenance: '',
  vendorAssessmentLink: '',
  euAiActApplies: false,
  sectoralRegulation: [],
  crossBorderDataFlows: false,
  productionDate: '',
  lastReviewed: today(),
  nextReviewDue: nextReview(90),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

export default function InventoryApp() {
  const [systems, setSystems] = useState<AISystem[]>([]);
  const [editing, setEditing] = useState<AISystem | null>(null);
  const [query, setQuery] = useState('');
  const [filterRisk, setFilterRisk] = useState<string>('All');

  useEffect(() => {
    setSystems(listSystems());
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return systems.filter((s) => {
      if (filterRisk !== 'All' && s.internalRiskTier !== filterRisk) return false;
      if (q && !(`${s.name} ${s.businessOwner} ${s.businessPurpose} ${s.vendor}`.toLowerCase().includes(q)))
        return false;
      return true;
    });
  }, [systems, query, filterRisk]);

  const onSave = (s: AISystem) => {
    const parsed = aiSystemSchema.parse({ ...s, updatedAt: new Date().toISOString() });
    saveSystem(parsed);
    setSystems(listSystems());
    setEditing(null);
  };

  const onDelete = (id: string) => {
    if (!confirm('Delete this AI system entry?')) return;
    deleteSystem(id);
    setSystems(listSystems());
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2 text-sm text-ink-500">
          <Shield size={14} className="text-ok-600" aria-hidden />
          <span>Your data stays in your browser.</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => downloadInventoryExcel(filtered)}
            disabled={filtered.length === 0}
            className="btn btn-secondary btn-sm disabled:opacity-50"
          >
            <Download size={14} /> Excel
          </button>
          <button onClick={() => setEditing(blank())} className="btn btn-primary btn-sm">
            <Plus size={14} /> Add AI system
          </button>
        </div>
      </div>

      <div className="grid sm:grid-cols-[1fr_180px] gap-3 mb-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, owner, vendor, purpose..."
            className="form-input w-full pl-9 h-10 rounded-md border-ink-300 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/30 text-sm"
          />
        </div>
        <select
          value={filterRisk}
          onChange={(e) => setFilterRisk(e.target.value)}
          className="form-select rounded-md border-ink-300 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/30 text-sm"
        >
          <option>All</option>
          <option>Low</option>
          <option>Moderate</option>
          <option>High</option>
          <option>Critical</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-ink-700 font-medium">No AI systems yet.</p>
          <p className="text-sm text-ink-500 mt-1">
            Add your first system to start. All data stays in your browser.
          </p>
          <button onClick={() => setEditing(blank())} className="btn btn-primary btn-md mt-4">
            <Plus size={14} /> Add AI system
          </button>
        </div>
      ) : (
        <div className="card p-0 overflow-x-auto">
          <table className="min-w-full text-sm divide-y divide-ink-200">
            <thead className="bg-ink-50 text-xs font-semibold uppercase tracking-wide text-ink-500">
              <tr>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Type</th>
                <th className="px-4 py-3 text-left">EU AI Act</th>
                <th className="px-4 py-3 text-left">Risk</th>
                <th className="px-4 py-3 text-left">Owner</th>
                <th className="px-4 py-3 text-left">Next review</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-ink-50/50">
                  <td className="px-4 py-3 font-medium text-ink-900">{s.name}</td>
                  <td className="px-4 py-3">
                    <span className="badge-neutral">{s.status}</span>
                  </td>
                  <td className="px-4 py-3 text-ink-700">{s.aiType}</td>
                  <td className="px-4 py-3 text-ink-700">{s.euAiActTier}</td>
                  <td className="px-4 py-3">
                    <RiskBadge tier={s.internalRiskTier} />
                  </td>
                  <td className="px-4 py-3 text-ink-700">{s.businessOwner || '—'}</td>
                  <td className="px-4 py-3 text-ink-700">{s.nextReviewDue}</td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <button
                      onClick={() => setEditing(s)}
                      className="text-ink-500 hover:text-accent-700 mr-2"
                      aria-label="Edit"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={() => onDelete(s.id)}
                      className="text-ink-400 hover:text-risk-600"
                      aria-label="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <SystemFormModal
          initial={editing}
          onSave={onSave}
          onCancel={() => setEditing(null)}
        />
      )}
    </div>
  );
}

function RiskBadge({ tier }: { tier: string }) {
  const cls =
    tier === 'Critical'
      ? 'bg-risk-50 text-risk-700'
      : tier === 'High'
      ? 'bg-warn-50 text-warn-700'
      : tier === 'Moderate'
      ? 'bg-info-50 text-info-700'
      : 'bg-ok-50 text-ok-700';
  return <span className={`badge ${cls}`}>{tier}</span>;
}

function SystemFormModal({
  initial,
  onSave,
  onCancel,
}: {
  initial: AISystem;
  onSave: (s: AISystem) => void;
  onCancel: () => void;
}) {
  const [s, setS] = useState<AISystem>(initial);
  const [error, setError] = useState<string | null>(null);
  const set = <K extends keyof AISystem>(k: K, v: AISystem[K]) => setS((cur) => ({ ...cur, [k]: v }));

  const applySuggestion = () => {
    const eu = suggestEuAiActTier(s);
    const internal = suggestInternalRisk(s);
    setS((cur) => ({
      ...cur,
      euAiActTier: eu.tier,
      internalRiskTier: internal,
      classificationRationale: eu.rationale,
    }));
  };

  const submit = () => {
    if (!s.name.trim()) {
      setError('Name is required.');
      return;
    }
    setError(null);
    onSave(s);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="AI system form"
      className="fixed inset-0 z-50 bg-ink-900/50 flex items-end sm:items-center justify-center p-4 overflow-y-auto"
    >
      <div className="bg-white rounded-lg shadow-pop w-full max-w-2xl my-8">
        <div className="sticky top-0 bg-white border-b border-ink-200 px-6 py-4 flex items-center justify-between rounded-t-lg">
          <h2 className="text-lg font-semibold text-ink-900">
            {initial.name ? 'Edit AI system' : 'Add AI system'}
          </h2>
          <button onClick={onCancel} className="text-ink-500 hover:text-ink-900" aria-label="Close">
            ✕
          </button>
        </div>

        <div className="px-6 py-4 space-y-4">
          <Field label="Name *">
            <input
              type="text"
              value={s.name}
              onChange={(e) => set('name', e.target.value)}
              className="form-input w-full rounded-md border-ink-300"
            />
          </Field>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Business owner">
              <input type="text" value={s.businessOwner} onChange={(e) => set('businessOwner', e.target.value)} className="form-input w-full rounded-md border-ink-300" />
            </Field>
            <Field label="Technical owner">
              <input type="text" value={s.technicalOwner} onChange={(e) => set('technicalOwner', e.target.value)} className="form-input w-full rounded-md border-ink-300" />
            </Field>
            <Field label="Business unit">
              <input type="text" value={s.businessUnit} onChange={(e) => set('businessUnit', e.target.value)} className="form-input w-full rounded-md border-ink-300" />
            </Field>
            <Field label="Vendor (if applicable)">
              <input type="text" value={s.vendor} onChange={(e) => set('vendor', e.target.value)} className="form-input w-full rounded-md border-ink-300" />
            </Field>
          </div>
          <Field label="Business purpose">
            <textarea
              value={s.businessPurpose}
              onChange={(e) => set('businessPurpose', e.target.value)}
              rows={3}
              className="form-textarea w-full rounded-md border-ink-300"
            />
          </Field>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Status">
              <select value={s.status} onChange={(e) => set('status', e.target.value as AISystem['status'])} className="form-select w-full rounded-md border-ink-300">
                {['Discovery', 'Approved', 'Development', 'Production', 'Retired'].map((o) => <option key={o}>{o}</option>)}
              </select>
            </Field>
            <Field label="AI type">
              <select value={s.aiType} onChange={(e) => set('aiType', e.target.value as AISystem['aiType'])} className="form-select w-full rounded-md border-ink-300">
                {['LLM', 'Agentic AI', 'Traditional ML', 'Computer Vision', 'Generative AI', 'Multi-modal', 'Recommender', 'Speech', 'Other'].map((o) => <option key={o}>{o}</option>)}
              </select>
            </Field>
            <Field label="Deployment">
              <select value={s.deploymentModel} onChange={(e) => set('deploymentModel', e.target.value as AISystem['deploymentModel'])} className="form-select w-full rounded-md border-ink-300">
                {['SaaS API', 'Self-hosted', 'Hybrid', 'Edge', 'Embedded'].map((o) => <option key={o}>{o}</option>)}
              </select>
            </Field>
            <Field label="Build vs buy">
              <select value={s.buildVsBuy} onChange={(e) => set('buildVsBuy', e.target.value as AISystem['buildVsBuy'])} className="form-select w-full rounded-md border-ink-300">
                {['Internal build', 'Vendor product', 'Open-source', 'Hybrid'].map((o) => <option key={o}>{o}</option>)}
              </select>
            </Field>
            <Field label="Autonomy level">
              <select value={s.autonomyLevel} onChange={(e) => set('autonomyLevel', e.target.value as AISystem['autonomyLevel'])} className="form-select w-full rounded-md border-ink-300">
                {['Read-only', 'Suggest', 'Act with approval', 'Autonomous'].map((o) => <option key={o}>{o}</option>)}
              </select>
            </Field>
            <Field label="Personal data involved">
              <label className="flex items-center gap-2 mt-2">
                <input type="checkbox" checked={s.personalDataInvolved} onChange={(e) => set('personalDataInvolved', e.target.checked)} className="form-checkbox text-accent-700" />
                <span className="text-sm text-ink-700">Yes</span>
              </label>
            </Field>
          </div>

          <div className="card p-4 bg-accent-50/30 border-accent-200">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-ink-900">Risk classification</h3>
              <button onClick={applySuggestion} className="btn btn-secondary btn-sm">
                Auto-suggest from inputs
              </button>
            </div>
            <div className="grid sm:grid-cols-2 gap-4 mt-3">
              <Field label="EU AI Act tier">
                <select value={s.euAiActTier} onChange={(e) => set('euAiActTier', e.target.value as AISystem['euAiActTier'])} className="form-select w-full rounded-md border-ink-300">
                  {['Prohibited', 'High-risk', 'Limited', 'Minimal', 'Unassessed'].map((o) => <option key={o}>{o}</option>)}
                </select>
              </Field>
              <Field label="Internal risk tier">
                <select value={s.internalRiskTier} onChange={(e) => set('internalRiskTier', e.target.value as AISystem['internalRiskTier'])} className="form-select w-full rounded-md border-ink-300">
                  {['Low', 'Moderate', 'High', 'Critical'].map((o) => <option key={o}>{o}</option>)}
                </select>
              </Field>
            </div>
            <Field label="Classification rationale">
              <textarea
                value={s.classificationRationale}
                onChange={(e) => set('classificationRationale', e.target.value)}
                rows={2}
                className="form-textarea w-full rounded-md border-ink-300 mt-2"
              />
            </Field>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Production date">
              <input type="date" value={s.productionDate} onChange={(e) => set('productionDate', e.target.value)} className="form-input w-full rounded-md border-ink-300" />
            </Field>
            <Field label="Next review due">
              <input type="date" value={s.nextReviewDue} onChange={(e) => set('nextReviewDue', e.target.value)} className="form-input w-full rounded-md border-ink-300" />
            </Field>
          </div>

          {error && <p className="text-sm text-risk-700">{error}</p>}
        </div>

        <div className="sticky bottom-0 bg-white border-t border-ink-200 px-6 py-4 flex items-center justify-end gap-2 rounded-b-lg">
          <button onClick={onCancel} className="btn btn-ghost btn-md">Cancel</button>
          <button onClick={submit} className="btn btn-primary btn-md">Save</button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-ink-700 mb-1">{label}</span>
      {children}
    </label>
  );
}
