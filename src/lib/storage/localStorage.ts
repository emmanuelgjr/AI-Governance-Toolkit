import {
  aiSystemSchema,
  aiiaSchema,
  riskSchema,
  exportBundleSchema,
  type AISystem,
  type AIIA,
  type Risk,
  type ExportBundle,
} from './schemas';

const KEY_SYSTEMS = 'agt.systems.v1';
const KEY_AIIAS = 'agt.aiias.v1';
const KEY_RISKS = 'agt.risks.v1';

const isBrowser = () => typeof window !== 'undefined' && typeof localStorage !== 'undefined';

function readArray<T>(key: string, parse: (x: unknown) => T): T[] {
  if (!isBrowser()) return [];
  const raw = localStorage.getItem(key);
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    return arr.map(parse);
  } catch {
    return [];
  }
}

function writeArray<T>(key: string, items: T[]) {
  if (!isBrowser()) return;
  localStorage.setItem(key, JSON.stringify(items));
}

// Systems
export function listSystems(): AISystem[] {
  return readArray(KEY_SYSTEMS, (x) => aiSystemSchema.parse(x));
}

export function saveSystem(system: AISystem) {
  const items = listSystems();
  const idx = items.findIndex((s) => s.id === system.id);
  if (idx >= 0) items[idx] = system;
  else items.push(system);
  writeArray(KEY_SYSTEMS, items);
}

export function getSystem(id: string): AISystem | null {
  return listSystems().find((s) => s.id === id) ?? null;
}

export function deleteSystem(id: string) {
  writeArray(
    KEY_SYSTEMS,
    listSystems().filter((s) => s.id !== id),
  );
}

// AIIAs
export function listAiias(): AIIA[] {
  return readArray(KEY_AIIAS, (x) => aiiaSchema.parse(x));
}

export function saveAiia(aiia: AIIA) {
  const items = listAiias();
  const idx = items.findIndex((a) => a.id === aiia.id);
  if (idx >= 0) items[idx] = aiia;
  else items.push(aiia);
  writeArray(KEY_AIIAS, items);
}

export function getAiia(id: string): AIIA | null {
  return listAiias().find((a) => a.id === id) ?? null;
}

export function deleteAiia(id: string) {
  writeArray(
    KEY_AIIAS,
    listAiias().filter((a) => a.id !== id),
  );
}

// Risks
export function listRisks(): Risk[] {
  return readArray(KEY_RISKS, (x) => riskSchema.parse(x));
}

export function saveRisk(risk: Risk) {
  const items = listRisks();
  const idx = items.findIndex((r) => r.id === risk.id);
  if (idx >= 0) items[idx] = risk;
  else items.push(risk);
  writeArray(KEY_RISKS, items);
}

export function deleteRisk(id: string) {
  writeArray(
    KEY_RISKS,
    listRisks().filter((r) => r.id !== id),
  );
}

// Bulk
export function exportAll(): ExportBundle {
  return {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    systems: listSystems(),
    aiias: listAiias(),
    risks: listRisks(),
  };
}

export function importAll(bundle: unknown, mode: 'replace' | 'merge' = 'replace') {
  const parsed = exportBundleSchema.parse(bundle);
  if (mode === 'replace') {
    writeArray(KEY_SYSTEMS, parsed.systems);
    writeArray(KEY_AIIAS, parsed.aiias);
    writeArray(KEY_RISKS, parsed.risks);
    return;
  }
  // merge
  const sysIds = new Set(parsed.systems.map((s) => s.id));
  const aiiaIds = new Set(parsed.aiias.map((a) => a.id));
  const riskIds = new Set(parsed.risks.map((r) => r.id));
  writeArray(KEY_SYSTEMS, [
    ...listSystems().filter((s) => !sysIds.has(s.id)),
    ...parsed.systems,
  ]);
  writeArray(KEY_AIIAS, [
    ...listAiias().filter((a) => !aiiaIds.has(a.id)),
    ...parsed.aiias,
  ]);
  writeArray(KEY_RISKS, [
    ...listRisks().filter((r) => !riskIds.has(r.id)),
    ...parsed.risks,
  ]);
}

export function clearAll() {
  if (!isBrowser()) return;
  localStorage.removeItem(KEY_SYSTEMS);
  localStorage.removeItem(KEY_AIIAS);
  localStorage.removeItem(KEY_RISKS);
}
