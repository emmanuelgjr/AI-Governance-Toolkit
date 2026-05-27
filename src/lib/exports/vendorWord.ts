import {
  Document, Packer, Paragraph, HeadingLevel, AlignmentType,
  TextRun, Footer, PageNumber, Table, TableRow, TableCell,
  WidthType, BorderStyle,
} from 'docx';
import type { VendorQuestionnaire } from '../storage/schemas';

const ACCENT = '5B21B6';
const INK_500 = '64748B';
const ANSWER_LABELS = ['Not addressed', 'Ad hoc / informal', 'Partially implemented', 'Substantially implemented', 'Fully implemented'];

interface Category {
  key: string;
  title: string;
  questions: { id: string; text: string; weight: number; redFlagThreshold: number }[];
}

function kvRow(label: string, value: string): TableRow {
  return new TableRow({
    children: [
      new TableCell({
        children: [new Paragraph({ children: [new TextRun({ text: label, bold: true, size: 18, color: INK_500 })] })],
        width: { size: 35, type: WidthType.PERCENTAGE },
        borders: { top: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.SINGLE, size: 1, color: 'E2E8F0' } },
      }),
      new TableCell({
        children: [new Paragraph({ children: [new TextRun({ text: value, size: 18 })] })],
        width: { size: 65, type: WidthType.PERCENTAGE },
        borders: { top: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.SINGLE, size: 1, color: 'E2E8F0' } },
      }),
    ],
  });
}

export async function downloadVendorWord(vq: VendorQuestionnaire, categories: Category[]) {
  const children: any[] = [];

  children.push(
    new Paragraph({ children: [new TextRun({ text: 'AI GOVERNANCE TOOLKIT', size: 18, bold: true, color: ACCENT })], spacing: { after: 80 } }),
    new Paragraph({ text: 'AI Vendor Assessment Report', heading: HeadingLevel.HEADING_1, spacing: { after: 80 } }),
    new Paragraph({ children: [new TextRun({ text: `Vendor: ${vq.vendorName || '(unnamed)'} · Date: ${vq.assessmentDate} · Assessor: ${vq.assessorName || '(not specified)'}`, size: 18, color: INK_500 })], spacing: { after: 200 } }),
  );

  children.push(
    new Paragraph({ text: 'Summary', heading: HeadingLevel.HEADING_2, spacing: { before: 240, after: 120 } }),
    new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [
      kvRow('Overall Score', `${vq.overallScore}%`),
      kvRow('Risk Level', vq.riskLevel),
      kvRow('Red Flags', `${vq.redFlags.length} identified`),
      kvRow('Status', vq.status),
    ]}),
  );

  if (vq.redFlags.length > 0) {
    children.push(
      new Paragraph({ text: 'Red Flags', heading: HeadingLevel.HEADING_2, spacing: { before: 240, after: 120 } }),
      ...vq.redFlags.map((f) => new Paragraph({
        children: [new TextRun({ text: `⚠ ${f}`, size: 20, color: 'DC2626' })],
        spacing: { after: 60 },
        indent: { left: 360 },
      })),
    );
  }

  for (const cat of categories) {
    children.push(new Paragraph({ text: cat.title, heading: HeadingLevel.HEADING_2, spacing: { before: 240, after: 120 } }));
    for (const q of cat.questions) {
      const val = vq.answers[q.id] ?? 0;
      const label = ANSWER_LABELS[val] ?? 'Not answered';
      const isRedFlag = val <= q.redFlagThreshold && q.redFlagThreshold > 0;
      children.push(new Paragraph({
        children: [
          new TextRun({ text: q.text, size: 20, bold: true }),
        ],
        spacing: { after: 40 },
      }));
      children.push(new Paragraph({
        children: [
          new TextRun({ text: `Score: ${val}/4 — ${label}`, size: 18, color: isRedFlag ? 'DC2626' : INK_500 }),
          ...(isRedFlag ? [new TextRun({ text: ' (RED FLAG)', size: 18, bold: true, color: 'DC2626' })] : []),
        ],
        spacing: { after: 100 },
        indent: { left: 360 },
      }));
    }
  }

  if (vq.notes) {
    children.push(
      new Paragraph({ text: 'Assessor Notes', heading: HeadingLevel.HEADING_2, spacing: { before: 240, after: 120 } }),
      new Paragraph({ children: [new TextRun({ text: vq.notes, size: 20 })], spacing: { after: 100 } }),
    );
  }

  const doc = new Document({
    creator: 'AI Governance Toolkit',
    title: `Vendor Assessment — ${vq.vendorName}`,
    sections: [{
      properties: { page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: 'AI Governance Toolkit · Vendor Assessment · Page ', size: 16, color: '94A3B8' }),
              new TextRun({ children: [PageNumber.CURRENT], size: 16, color: '94A3B8' }),
              new TextRun({ text: ' · CC-BY 4.0', size: 16, color: '94A3B8' }),
            ],
          })],
        }),
      },
      children,
    }],
  });

  const blob = await Packer.toBlob(doc);
  if (typeof document === 'undefined') return;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `vendor-assessment-${vq.vendorName.replace(/\s+/g, '-').toLowerCase() || 'unnamed'}.docx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
