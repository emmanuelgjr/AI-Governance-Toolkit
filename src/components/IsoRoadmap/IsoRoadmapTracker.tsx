import { useEffect, useMemo, useState } from 'react';
import { RotateCcw, Shield } from 'lucide-react';
import {
  getIsoRoadmapProgress,
  setIsoRoadmapProgress,
} from '../../lib/storage/localStorage';

export interface RoadmapPhase {
  name: string;
  weeks: string;
  clauses: string;
  items: string[];
  toolkit: string[];
}

interface Props {
  phases: RoadmapPhase[];
}

// Progress is keyed by "<phase name>::<activity text>" so reordering
// phases or activities doesn't orphan saved checkmarks.
const itemKey = (phase: string, item: string) => `${phase}::${item}`;

export default function IsoRoadmapTracker({ phases }: Props) {
  const [progress, setProgress] = useState<Record<string, boolean>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setProgress(getIsoRoadmapProgress());
    setLoaded(true);
  }, []);

  const toggle = (key: string) => {
    setProgress((cur) => {
      const next = { ...cur, [key]: !cur[key] };
      if (!next[key]) delete next[key];
      setIsoRoadmapProgress(next);
      return next;
    });
  };

  const reset = () => {
    if (!confirm('Reset all roadmap progress? This cannot be undone.')) return;
    setIsoRoadmapProgress({});
    setProgress({});
  };

  const totals = useMemo(() => {
    const perPhase = phases.map((p) => {
      const done = p.items.filter((i) => progress[itemKey(p.name, i)]).length;
      return { done, total: p.items.length };
    });
    const done = perPhase.reduce((a, b) => a + b.done, 0);
    const total = perPhase.reduce((a, b) => a + b.total, 0);
    return { perPhase, done, total };
  }, [phases, progress]);

  const overallPct = totals.total === 0 ? 0 : Math.round((totals.done / totals.total) * 100);

  return (
    <div>
      <div className="card mt-12">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-ink-900">Your implementation progress</h2>
            <p className="text-sm text-ink-500 mt-0.5 flex items-center gap-1.5">
              <Shield size={13} className="text-ok-600" aria-hidden />
              Saved in your browser only — nothing leaves your machine. Included in the
              JSON backup on the Data page.
            </p>
          </div>
          <button
            onClick={reset}
            disabled={totals.done === 0}
            className="btn btn-ghost btn-sm disabled:opacity-40"
          >
            <RotateCcw size={14} /> Reset
          </button>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <div
            className="flex-1 h-2.5 rounded-full bg-ink-100 overflow-hidden"
            role="progressbar"
            aria-valuenow={overallPct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Overall roadmap progress"
          >
            <div
              className="h-full bg-accent-700 transition-all duration-300"
              style={{ width: `${overallPct}%` }}
            />
          </div>
          <span className="text-sm font-mono text-ink-700 whitespace-nowrap">
            {totals.done}/{totals.total} · {overallPct}%
          </span>
        </div>
      </div>

      <ol className="mt-6 space-y-6">
        {phases.map((p, idx) => {
          const { done, total } = totals.perPhase[idx];
          const pct = total === 0 ? 0 : Math.round((done / total) * 100);
          return (
            <li key={p.name} className="card">
              <div className="flex items-center justify-between flex-wrap gap-3 mb-2">
                <div>
                  <p className="font-mono text-xs text-ink-500">
                    Phase {String(idx + 1).padStart(2, '0')} · {p.weeks}
                  </p>
                  <h2 className="text-2xl font-semibold text-ink-900 mt-1">{p.name}</h2>
                </div>
                <div className="flex items-center gap-3">
                  <span className="badge-neutral">Clauses {p.clauses}</span>
                  <span
                    className={`text-xs font-mono ${pct === 100 ? 'text-ok-700' : 'text-ink-500'}`}
                  >
                    {done}/{total}
                  </span>
                </div>
              </div>
              <div
                className="h-1.5 rounded-full bg-ink-100 overflow-hidden mb-4"
                role="progressbar"
                aria-valuenow={pct}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${p.name} phase progress`}
              >
                <div
                  className={`h-full transition-all duration-300 ${pct === 100 ? 'bg-ok-600' : 'bg-accent-700'}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-500 mb-2">
                    Activities
                  </h3>
                  <ul className="space-y-2">
                    {p.items.map((item) => {
                      const key = itemKey(p.name, item);
                      const checked = !!progress[key];
                      return (
                        <li key={key}>
                          <label className="flex items-start gap-2.5 cursor-pointer group">
                            <input
                              type="checkbox"
                              checked={checked}
                              disabled={!loaded}
                              onChange={() => toggle(key)}
                              className="form-checkbox mt-0.5 rounded text-accent-700 focus:ring-accent-500"
                            />
                            <span
                              className={`text-sm leading-snug ${
                                checked ? 'text-ink-400 line-through' : 'text-ink-700 group-hover:text-ink-900'
                              }`}
                            >
                              {item}
                            </span>
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                </div>
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-500 mb-2">
                    Toolkit modules
                  </h3>
                  <ul className="text-sm text-ink-700 space-y-1.5 list-disc list-inside">
                    {p.toolkit.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
