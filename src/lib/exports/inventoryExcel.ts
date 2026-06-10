import ExcelJS from 'exceljs';
import type { AISystem } from '../storage/schemas';

export async function inventoryExcelExport(systems: AISystem[]): Promise<Blob> {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'AI Governance Toolkit';
  wb.created = new Date();

  const ws = wb.addWorksheet('AI System Inventory', {
    views: [{ state: 'frozen', ySplit: 1 }],
  });

  ws.columns = [
    { header: 'Name', key: 'name', width: 28 },
    { header: 'Business owner', key: 'businessOwner', width: 18 },
    { header: 'Technical owner', key: 'technicalOwner', width: 18 },
    { header: 'Business unit', key: 'businessUnit', width: 16 },
    { header: 'Status', key: 'status', width: 12 },
    { header: 'AI type', key: 'aiType', width: 14 },
    { header: 'Deployment', key: 'deploymentModel', width: 14 },
    { header: 'Build vs buy', key: 'buildVsBuy', width: 14 },
    { header: 'Personal data', key: 'personalDataInvolved', width: 12 },
    { header: 'EU AI Act tier', key: 'euAiActTier', width: 14 },
    { header: 'Internal risk', key: 'internalRiskTier', width: 14 },
    { header: 'Autonomy', key: 'autonomyLevel', width: 18 },
    { header: 'Vendor', key: 'vendor', width: 16 },
    { header: 'Production date', key: 'productionDate', width: 14 },
    { header: 'Last red-team', key: 'lastRedTeamDate', width: 14 },
    { header: 'Red-team notes', key: 'lastRedTeamNotes', width: 24 },
    { header: 'Last reviewed', key: 'lastReviewed', width: 14 },
    { header: 'Next review', key: 'nextReviewDue', width: 14 },
    { header: 'Business purpose', key: 'businessPurpose', width: 50 },
  ];

  ws.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  ws.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF5B21B6' },
  };
  ws.getRow(1).alignment = { vertical: 'middle' };

  for (const s of systems) {
    ws.addRow({
      ...s,
      personalDataInvolved: s.personalDataInvolved ? 'Yes' : 'No',
    });
  }

  const totals = wb.addWorksheet('Metrics');
  totals.columns = [{ width: 28 }, { width: 12 }];
  totals.addRow(['Total systems', systems.length]);
  const byTier: Record<string, number> = {};
  for (const s of systems) byTier[s.internalRiskTier] = (byTier[s.internalRiskTier] ?? 0) + 1;
  for (const [k, v] of Object.entries(byTier)) totals.addRow([`Risk: ${k}`, v]);
  totals.getColumn(1).font = { bold: true };

  const buf = await wb.xlsx.writeBuffer();
  return new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

export async function downloadInventoryExcel(systems: AISystem[]) {
  const blob = await inventoryExcelExport(systems);
  if (typeof document === 'undefined') return;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ai-inventory-${new Date().toISOString().slice(0, 10)}.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
