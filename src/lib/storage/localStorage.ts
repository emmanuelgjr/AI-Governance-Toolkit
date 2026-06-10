import {
  aiSystemSchema,
  aiiaSchema,
  riskSchema,
  vendorQuestionnaireSchema,
  maturityAssessmentSchema,
  exportBundleSchema,
  type AISystem,
  type AIIA,
  type Risk,
  type VendorQuestionnaire,
  type MaturityAssessment,
  type ExportBundle,
} from './schemas';

const KEY_SYSTEMS = 'agt.systems.v1';
const KEY_AIIAS = 'agt.aiias.v1';
const KEY_RISKS = 'agt.risks.v1';
const KEY_VENDOR_QS = 'agt.vendor-questionnaires.v1';
const KEY_MATURITY = 'agt.maturity-assessments.v1';
const KEY_ISO_ROADMAP = 'agt.iso-roadmap-progress.v1';

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

// Vendor Questionnaires
export function listVendorQuestionnaires(): VendorQuestionnaire[] {
  return readArray(KEY_VENDOR_QS, (x) => vendorQuestionnaireSchema.parse(x));
}

export function saveVendorQuestionnaire(vq: VendorQuestionnaire) {
  const items = listVendorQuestionnaires();
  const idx = items.findIndex((v) => v.id === vq.id);
  if (idx >= 0) items[idx] = vq;
  else items.push(vq);
  writeArray(KEY_VENDOR_QS, items);
}

export function deleteVendorQuestionnaire(id: string) {
  writeArray(KEY_VENDOR_QS, listVendorQuestionnaires().filter((v) => v.id !== id));
}

// Maturity Assessments
export function listMaturityAssessments(): MaturityAssessment[] {
  return readArray(KEY_MATURITY, (x) => maturityAssessmentSchema.parse(x));
}

export function saveMaturityAssessment(ma: MaturityAssessment) {
  const items = listMaturityAssessments();
  const idx = items.findIndex((m) => m.id === ma.id);
  if (idx >= 0) items[idx] = ma;
  else items.push(ma);
  writeArray(KEY_MATURITY, items);
}

export function deleteMaturityAssessment(id: string) {
  writeArray(KEY_MATURITY, listMaturityAssessments().filter((m) => m.id !== id));
}

// ISO 42001 roadmap progress
export function getIsoRoadmapProgress(): Record<string, boolean> {
  if (!isBrowser()) return {};
  const raw = localStorage.getItem(KEY_ISO_ROADMAP);
  if (!raw) return {};
  try {
    const obj = JSON.parse(raw);
    if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) return {};
    return Object.fromEntries(
      Object.entries(obj).filter(([, v]) => typeof v === 'boolean'),
    ) as Record<string, boolean>;
  } catch {
    return {};
  }
}

export function setIsoRoadmapProgress(progress: Record<string, boolean>) {
  if (!isBrowser()) return;
  localStorage.setItem(KEY_ISO_ROADMAP, JSON.stringify(progress));
}

// Bulk
export function exportAll(): ExportBundle {
  return {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    systems: listSystems(),
    aiias: listAiias(),
    risks: listRisks(),
    isoRoadmapProgress: getIsoRoadmapProgress(),
  };
}

export function importAll(bundle: unknown, mode: 'replace' | 'merge' = 'replace') {
  const parsed = exportBundleSchema.parse(bundle);
  if (mode === 'replace') {
    writeArray(KEY_SYSTEMS, parsed.systems);
    writeArray(KEY_AIIAS, parsed.aiias);
    writeArray(KEY_RISKS, parsed.risks);
    setIsoRoadmapProgress(parsed.isoRoadmapProgress);
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
  setIsoRoadmapProgress({ ...getIsoRoadmapProgress(), ...parsed.isoRoadmapProgress });
}

export function clearAll() {
  if (!isBrowser()) return;
  localStorage.removeItem(KEY_SYSTEMS);
  localStorage.removeItem(KEY_AIIAS);
  localStorage.removeItem(KEY_RISKS);
  localStorage.removeItem(KEY_ISO_ROADMAP);
}
