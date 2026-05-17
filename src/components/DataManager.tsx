import { useEffect, useState } from 'react';
import { Download, Upload, Trash2 } from 'lucide-react';
import { exportAll, importAll, clearAll, listSystems, listAiias, listRisks } from '../lib/storage/localStorage';

export default function DataManager() {
  const [counts, setCounts] = useState({ systems: 0, aiias: 0, risks: 0 });
  const [message, setMessage] = useState<string | null>(null);

  const refresh = () =>
    setCounts({
      systems: listSystems().length,
      aiias: listAiias().length,
      risks: listRisks().length,
    });

  useEffect(refresh, []);

  const onExport = () => {
    const bundle = exportAll();
    const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agt-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setMessage('Exported.');
  };

  const onImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        importAll(JSON.parse(String(reader.result)), 'replace');
        refresh();
        setMessage('Imported (replace mode).');
      } catch (err) {
        setMessage(`Import failed: ${err instanceof Error ? err.message : String(err)}`);
      }
    };
    reader.readAsText(file);
  };

  const onClear = () => {
    if (!confirm('Clear all toolkit data from this browser? This cannot be undone.')) return;
    clearAll();
    refresh();
    setMessage('Cleared.');
  };

  return (
    <div className="space-y-6">
      <div className="card">
        <h3 className="text-lg font-semibold text-ink-900">What's currently stored</h3>
        <ul className="mt-3 text-sm text-ink-700 space-y-1">
          <li>{counts.systems} AI systems</li>
          <li>{counts.aiias} AI Impact Assessments</li>
          <li>{counts.risks} risks</li>
        </ul>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-ink-900">Export</h3>
        <p className="text-sm text-ink-600 mt-2">Download a JSON bundle of everything stored in this browser.</p>
        <button onClick={onExport} className="btn btn-primary btn-md mt-4">
          <Download size={16} /> Export JSON
        </button>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-ink-900">Import</h3>
        <p className="text-sm text-ink-600 mt-2">Restore from a JSON bundle. Replaces current data.</p>
        <label className="btn btn-secondary btn-md mt-4 cursor-pointer">
          <Upload size={16} /> Choose file…
          <input type="file" accept="application/json" onChange={onImport} className="hidden" />
        </label>
      </div>

      <div className="card border-risk-200">
        <h3 className="text-lg font-semibold text-risk-700">Clear all data</h3>
        <p className="text-sm text-ink-600 mt-2">Remove everything stored by the toolkit in this browser. Cannot be undone.</p>
        <button onClick={onClear} className="btn btn-md mt-4 bg-risk-600 hover:bg-risk-700 text-white">
          <Trash2 size={16} /> Clear all
        </button>
      </div>

      {message && (
        <p
          role="status"
          aria-live="polite"
          className="text-sm text-accent-700 bg-accent-50 px-3 py-2 rounded-md"
        >
          {message}
        </p>
      )}
    </div>
  );
}
