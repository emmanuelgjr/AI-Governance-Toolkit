import ExcelJS from 'exceljs';
import type { Risk } from '../storage/schemas';

export async function riskRegisterExcelExport(risks: Risk[]): Promise<Blob> {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'AI Governance Toolkit';
  wb.created = new Date();

  const ws = wb.addWorksheet('AI Risk Register', {
    views: [{ state: 'frozen', ySplit: 1 }],
  });

  ws.columns = [
    { header: 'Title', key: 'title', width: 36 },
    { header: 'Category', key: 'category', width: 14 },
    { header: 'Status', key: 'status', width: 12 },
    { header: 'Owner', key: 'owner', width: 18 },
    { header: 'Treatment', key: 'treatment', width: 12 },
    { header: 'Inherent L', key: 'inherentLikelihood', width: 11 },
    { header: 'Inherent I', key: 'inherentImpact', width: 11 },
    { header: 'Inherent score', key: 'inherentScore', width: 13 },
    { header: 'Residual L', key: 'residualLikelihood', width: 11 },
    { header: 'Residual I', key: 'residualImpact', width: 11 },
    { header: 'Residual score', key: 'residualScore', width: 13 },
    { header: 'Linked systems', key: 'linkedSystemIds', width: 24 },
    { header: 'Existing controls', key: 'existingControls', width: 30 },
    { header: 'Catalog refs', key: 'controlCatalogRefs', width: 18 },
    { header: 'Action items', key: 'actionItems', width: 30 },
    { header: 'Last reviewed', key: 'lastReviewed', width: 14 },
    { header: 'Next review', key: 'nextReview', width: 14 },
  ];

  ws.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  ws.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF5B21B6' },
  };

  for (const r of risks) {
    ws.addRow({
      ...r,
      inherentScore: r.inherentLikelihood * r.inherentImpact,
      residualScore: r.residualLikelihood * r.residualImpact,
      linkedSystemIds: r.linkedSystemIds.join('; '),
      controlCatalogRefs: r.controlCatalogRefs.join(', '),
    });
  }

  // Heatmap sheet
  const heat = wb.addWorksheet('Heatmap');
  heat.addRow(['', 'Impact 1', 'Impact 2', 'Impact 3', 'Impact 4', 'Impact 5']);
  for (let l = 5; l >= 1; l--) {
    const row: (string | number)[] = [`Likelihood ${l}`];
    for (let i = 1; i <= 5; i++) {
      const count = risks.filter(
        (r) => r.residualLikelihood === l && r.residualImpact === i,
      ).length;
      row.push(count);
    }
    heat.addRow(row);
  }
  heat.getRow(1).font = { bold: true };
  heat.getColumn(1).font = { bold: true };

  const buf = await wb.xlsx.writeBuffer();
  return new Blob([buf], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}

export async function downloadRiskExcel(risks: Risk[]) {
  const blob = await riskRegisterExcelExport(risks);
  if (typeof document === 'undefined') return;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ai-risk-register-${new Date().toISOString().slice(0, 10)}.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
