import { useEffect, useMemo, useState } from 'react';
import { Download, Plus, Edit, Trash2, Shield } from 'lucide-react';
import { v4 as uuid } from 'uuid';
import {
  listRisks,
  saveRisk,
  deleteRisk,
  listSystems,
} from '../../lib/storage/localStorage';
import { downloadRiskExcel } from '../../lib/exports/riskExcel';
import type { Risk, AISystem } from '../../lib/storage/schemas';

const today = () => new Date().toISOString().slice(0, 10);
const futureDate = (days: number) =>
  new Date(Date.now() + days * 86_400_000).toISOString().slice(0, 10);

const blank = (): Risk => ({
  id: uuid(),
  title: '',
  description: '',
  linkedSystemIds: [],
  category: 'Security',
  inherentLikelihood: 3,
  inherentImpact: 3,
  existingControls: '',
  controlCatalogRefs: [],
  residualLikelihood: 2,
  residualImpact: 2,
  owner: '',
  treatment: 'Mitigate',
  actionItems: '',
  status: 'Open',
  lastReviewed: today(),
  nextReview: futureDate(90),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

export default function RiskRegisterApp() {
  const [risks, setRisks] = useState<Risk[]>([]);
  const [systems, setSystems] = useState<AISystem[]>([]);
  const [editing, setEditing] = useState<Risk | null>(null);
  const [view, setView] = useState<'table' | 'heatmap'>('table');

  useEffect(() => {
    setRisks(listRisks());
    setSystems(listSystems());
  }, []);

  const onSave = (r: Risk) => {
    saveRisk({ ...r, updatedAt: new Date().toISOString() });
    setRisks(listRisks());
    setEditing(null);
  };

  const onDelete = (id: string) => {
    if (!confirm('Delete this risk entry?')) return;
    deleteRisk(id);
    setRisks(listRisks());
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2 text-sm text-ink-500">
          <Shield size={14} className="text-ok-600" aria-hidden />
          <span>Your risk register stays in your browser.</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-md border border-ink-200 overflow-hidden text-sm">
            <button
              onClick={() => setView('table')}
              className={`px-3 py-1.5 ${view === 'table' ? 'bg-accent-700 text-white' : 'text-ink-700'}`}
            >
              Table
            </button>
            <button
              onClick={() => setView('heatmap')}
              className={`px-3 py-1.5 ${view === 'heatmap' ? 'bg-accent-700 text-white' : 'text-ink-700'}`}
            >
              Heatmap
            </button>
          </div>
          <button
            onClick={() => downloadRiskExcel(risks)}
            disabled={risks.length === 0}
            className="btn btn-secondary btn-sm disabled:opacity-50"
          >
            <Download size={14} /> Excel
          </button>
          <button onClick={() => setEditing(blank())} className="btn btn-primary btn-sm">
            <Plus size={14} /> Add risk
          </button>
        </div>
      </div>

      {risks.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-ink-700 font-medium">No risks yet.</p>
          <p className="text-sm text-ink-500 mt-1">Add a risk to start populating the register.</p>
          <button onClick={() => setEditing(blank())} className="btn btn-primary btn-md mt-4">
            <Plus size={14} /> Add risk
          </button>
        </div>
      ) : view === 'table' ? (
        <RiskTable risks={risks} onEdit={setEditing} onDelete={onDelete} />
      ) : (
        <RiskHeatmap risks={risks} />
      )}

      {editing && (
        <RiskFormModal
          initial={editing}
          systems={systems}
          onSave={onSave}
          onCancel={() => setEditing(null)}
        />
      )}
    </div>
  );
}

function RiskTable({
  risks,
  onEdit,
  onDelete,
}: {
  risks: Risk[];
  onEdit: (r: Risk) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="card p-0 overflow-x-auto">
      <table className="min-w-full text-sm divide-y divide-ink-200">
        <thead className="bg-ink-50 text-xs font-semibold uppercase tracking-wide text-ink-500">
          <tr>
            <th className="px-4 py-3 text-left">Title</th>
            <th className="px-4 py-3 text-left">Category</th>
            <th className="px-4 py-3 text-left">Owner</th>
            <th className="px-4 py-3 text-left">Status</th>
            <th className="px-4 py-3 text-left">Inherent</th>
            <th className="px-4 py-3 text-left">Residual</th>
            <th className="px-4 py-3 text-left">Treatment</th>
            <th className="px-4 py-3 text-left">Next review</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-100">
          {risks.map((r) => (
            <tr key={r.id} className="hover:bg-ink-50/50">
              <td className="px-4 py-3 font-medium text-ink-900">{r.title}</td>
              <td className="px-4 py-3 text-ink-700">{r.category}</td>
              <td className="px-4 py-3 text-ink-700">{r.owner || '—'}</td>
              <td className="px-4 py-3"><span className="badge-neutral">{r.status}</span></td>
              <td className="px-4 py-3 text-ink-700 font-mono">{r.inherentLikelihood}×{r.inherentImpact}={r.inherentLikelihood * r.inherentImpact}</td>
              <td className="px-4 py-3 text-ink-700 font-mono">{r.residualLikelihood}×{r.residualImpact}={r.residualLikelihood * r.residualImpact}</td>
              <td className="px-4 py-3 text-ink-700">{r.treatment}</td>
              <td className="px-4 py-3 text-ink-700">{r.nextReview}</td>
              <td className="px-4 py-3 text-right whitespace-nowrap">
                <button onClick={() => onEdit(r)} className="text-ink-500 hover:text-accent-700 mr-2" aria-label="Edit">
                  <Edit size={14} />
                </button>
                <button onClick={() => onDelete(r.id)} className="text-ink-400 hover:text-risk-600" aria-label="Delete">
                  <Trash2 size={14} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RiskHeatmap({ risks }: { risks: Risk[] }) {
  const cell = (l: number, i: number) => {
    const count = risks.filter((r) => r.residualLikelihood === l && r.residualImpact === i).length;
    const score = l * i;
    const bg =
      score >= 15 ? 'bg-risk-50 text-risk-700 border-risk-200'
      : score >= 8 ? 'bg-warn-50 text-warn-700 border-warn-200'
      : score >= 4 ? 'bg-info-50 text-info-700 border-info-200'
      : 'bg-ok-50 text-ok-700 border-ok-200';
    return (
      <td key={`${l}-${i}`} className={`p-3 border ${bg} text-center align-middle min-w-[64px]`}>
        <span className="block text-lg font-semibold">{count}</span>
        <span className="block text-[10px] uppercase tracking-wide">{score}</span>
      </td>
    );
  };
  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-ink-900 mb-2">Residual risk heatmap</h3>
      <p className="text-sm text-ink-500 mb-4">Counts of risks at each (likelihood × impact) cell.</p>
      <div className="overflow-x-auto">
        <table className="text-sm">
          <thead>
            <tr>
              <th className="p-3 text-ink-500 font-medium">L \\ I</th>
              {[1, 2, 3, 4, 5].map((i) => (
                <th key={i} className="p-3 text-ink-500 font-medium">{i}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[5, 4, 3, 2, 1].map((l) => (
              <tr key={l}>
                <th className="p-3 text-ink-500 font-medium">{l}</th>
                {[1, 2, 3, 4, 5].map((i) => cell(l, i))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RiskFormModal({
  initial,
  systems,
  onSave,
  onCancel,
}: {
  initial: Risk;
  systems: AISystem[];
  onSave: (r: Risk) => void;
  onCancel: () => void;
}) {
  const [r, setR] = useState<Risk>(initial);
  const set = <K extends keyof Risk>(k: K, v: Risk[K]) => setR((cur) => ({ ...cur, [k]: v }));
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    if (!r.title.trim()) {
      setError('Title is required.');
      return;
    }
    onSave(r);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Risk form"
      className="fixed inset-0 z-50 bg-ink-900/50 flex items-end sm:items-center justify-center p-4 overflow-y-auto"
    >
      <div className="bg-white rounded-lg shadow-pop w-full max-w-2xl my-8">
        <div className="sticky top-0 bg-white border-b border-ink-200 px-6 py-4 flex items-center justify-between rounded-t-lg">
          <h2 className="text-lg font-semibold text-ink-900">{initial.title ? 'Edit risk' : 'Add risk'}</h2>
          <button onClick={onCancel} className="text-ink-500 hover:text-ink-900" aria-label="Close">✕</button>
        </div>

        <div className="px-6 py-4 space-y-4">
          <Field label="Title *">
            <input value={r.title} onChange={(e) => set('title', e.target.value)} className="form-input w-full rounded-md border-ink-300" />
          </Field>
          <Field label="Description">
            <textarea value={r.description} onChange={(e) => set('description', e.target.value)} rows={3} className="form-textarea w-full rounded-md border-ink-300" />
          </Field>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Category">
              <select value={r.category} onChange={(e) => set('category', e.target.value as Risk['category'])} className="form-select w-full rounded-md border-ink-300">
                {['Bias', 'Privacy', 'Security', 'Operational', 'Reputational', 'Regulatory', 'Strategic', 'Third-party'].map((o) => <option key={o}>{o}</option>)}
              </select>
            </Field>
            <Field label="Owner">
              <input value={r.owner} onChange={(e) => set('owner', e.target.value)} className="form-input w-full rounded-md border-ink-300" />
            </Field>
          </div>
          <Field label="Linked AI systems">
            <select
              multiple
              value={r.linkedSystemIds}
              onChange={(e) =>
                set(
                  'linkedSystemIds',
                  Array.from(e.target.selectedOptions).map((o) => o.value),
                )
              }
              className="form-multiselect w-full rounded-md border-ink-300 h-24"
            >
              {systems.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <span className="text-xs text-ink-500">Hold Ctrl/Cmd to select multiple.</span>
          </Field>
          <Field label="Existing controls">
            <textarea value={r.existingControls} onChange={(e) => set('existingControls', e.target.value)} rows={2} className="form-textarea w-full rounded-md border-ink-300" />
          </Field>
          <Field label="AI Controls Catalog refs (comma-separated)">
            <input
              type="text"
              value={r.controlCatalogRefs.join(', ')}
              onChange={(e) => set('controlCatalogRefs', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
              placeholder="AI-CTRL-001, AI-CTRL-005"
              className="form-input w-full rounded-md border-ink-300"
            />
          </Field>

          <div className="grid sm:grid-cols-2 gap-4">
            <RatingPair label="Inherent" l={r.inherentLikelihood} i={r.inherentImpact} onL={(v) => set('inherentLikelihood', v)} onI={(v) => set('inherentImpact', v)} />
            <RatingPair label="Residual" l={r.residualLikelihood} i={r.residualImpact} onL={(v) => set('residualLikelihood', v)} onI={(v) => set('residualImpact', v)} />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Treatment">
              <select value={r.treatment} onChange={(e) => set('treatment', e.target.value as Risk['treatment'])} className="form-select w-full rounded-md border-ink-300">
                {['Accept', 'Mitigate', 'Transfer', 'Avoid'].map((o) => <option key={o}>{o}</option>)}
              </select>
            </Field>
            <Field label="Status">
              <select value={r.status} onChange={(e) => set('status', e.target.value as Risk['status'])} className="form-select w-full rounded-md border-ink-300">
                {['Open', 'In progress', 'Closed', 'Accepted'].map((o) => <option key={o}>{o}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Action items">
            <textarea value={r.actionItems} onChange={(e) => set('actionItems', e.target.value)} rows={3} className="form-textarea w-full rounded-md border-ink-300" />
          </Field>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Last reviewed">
              <input type="date" value={r.lastReviewed} onChange={(e) => set('lastReviewed', e.target.value)} className="form-input w-full rounded-md border-ink-300" />
            </Field>
            <Field label="Next review">
              <input type="date" value={r.nextReview} onChange={(e) => set('nextReview', e.target.value)} className="form-input w-full rounded-md border-ink-300" />
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

function RatingPair({
  label,
  l,
  i,
  onL,
  onI,
}: {
  label: string;
  l: number;
  i: number;
  onL: (v: number) => void;
  onI: (v: number) => void;
}) {
  const Pick = ({ value, onChange, name }: { value: number; onChange: (v: number) => void; name: string }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((v) => (
        <button
          key={v}
          onClick={() => onChange(v)}
          className={`w-8 h-8 rounded ${value === v ? 'bg-accent-700 text-white' : 'bg-ink-100 text-ink-700 hover:bg-ink-200'}`}
          aria-pressed={value === v}
          aria-label={`${name} ${v}`}
        >
          {v}
        </button>
      ))}
    </div>
  );
  return (
    <div>
      <p className="text-sm font-medium text-ink-700 mb-2">{label} (L × I = {l * i})</p>
      <div className="space-y-2">
        <div>
          <p className="text-xs text-ink-500 mb-1">Likelihood</p>
          <Pick value={l} onChange={onL} name={`${label} likelihood`} />
        </div>
        <div>
          <p className="text-xs text-ink-500 mb-1">Impact</p>
          <Pick value={i} onChange={onI} name={`${label} impact`} />
        </div>
      </div>
    </div>
  );
}
