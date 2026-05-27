import {
  Document,
  Packer,
  Paragraph,
  HeadingLevel,
  AlignmentType,
  TextRun,
  Footer,
  PageNumber,
  Header,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
} from 'docx';
import type { MaturityAssessment } from '../storage/schemas';

const ACCENT = '5B21B6';
const INK_900 = '0F172A';
const INK_500 = '64748B';

interface Domain {
  key: string;
  title: string;
  questions: string[];
}

const MATURITY_LABELS: Record<number, string> = {
  1: 'Initial',
  2: 'Developing',
  3: 'Defined',
  4: 'Managed',
  5: 'Optimizing',
};

function maturityLabel(score: number): string {
  const rounded = Math.round(score);
  return MATURITY_LABELS[Math.min(5, Math.max(1, rounded))] ?? 'Initial';
}

function domainAverage(
  scores: Record<string, number>,
  domainKey: string,
): number {
  let sum = 0;
  let count = 0;
  for (let qi = 0; qi < 5; qi++) {
    const v = scores[`${domainKey}.q${qi}`];
    if (v != null) {
      sum += v;
      count++;
    }
  }
  return count === 0 ? 1 : sum / count;
}

function h(text: string, level = HeadingLevel.HEADING_2) {
  return new Paragraph({
    heading: level,
    spacing: { before: 240, after: 120 },
    children: [new TextRun({ text, bold: true, color: INK_900 })],
  });
}

function p(text: string, opts: { italic?: boolean; bold?: boolean } = {}) {
  return new Paragraph({
    spacing: { after: 120 },
    children: [new TextRun({ text, italics: opts.italic, bold: opts.bold })],
  });
}

const BORDER_STYLE = {
  style: BorderStyle.SINGLE,
  size: 1,
  color: 'CBD5E1',
};

const CELL_BORDERS = {
  top: BORDER_STYLE,
  bottom: BORDER_STYLE,
  left: BORDER_STYLE,
  right: BORDER_STYLE,
};

function headerCell(text: string, width?: number): TableCell {
  return new TableCell({
    width: width ? { size: width, type: WidthType.PERCENTAGE } : undefined,
    borders: CELL_BORDERS,
    shading: { fill: 'F1F5F9' },
    children: [
      new Paragraph({
        spacing: { before: 40, after: 40 },
        children: [
          new TextRun({ text, bold: true, size: 18, color: INK_900 }),
        ],
      }),
    ],
  });
}

function textCell(text: string, width?: number): TableCell {
  return new TableCell({
    width: width ? { size: width, type: WidthType.PERCENTAGE } : undefined,
    borders: CELL_BORDERS,
    children: [
      new Paragraph({
        spacing: { before: 40, after: 40 },
        children: [new TextRun({ text, size: 18 })],
      }),
    ],
  });
}

export function generateMaturityDocx(
  ma: MaturityAssessment,
  domains: Domain[],
): Document {
  const today = new Date().toISOString().slice(0, 10);

  const overallScore =
    domains.reduce((sum, d) => sum + domainAverage(ma.scores, d.key), 0) /
    domains.length;

  const headerObj = new Header({
    children: [
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        children: [
          new TextRun({
            text: `Maturity Assessment — ${ma.name}`,
            size: 16,
            color: INK_500,
          }),
        ],
      }),
    ],
  });

  const footerObj = new Footer({
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({ text: 'Page ', size: 16, color: INK_500 }),
          new TextRun({
            children: [PageNumber.CURRENT],
            size: 16,
            color: INK_500,
          }),
          new TextRun({ text: ' of ', size: 16, color: INK_500 }),
          new TextRun({
            children: [PageNumber.TOTAL_PAGES],
            size: 16,
            color: INK_500,
          }),
          new TextRun({
            text: ' — AI Governance Toolkit · Maturity Assessment · CC-BY 4.0',
            size: 16,
            color: INK_500,
          }),
        ],
      }),
    ],
  });

  /* ---- Cover ---------------------------------------------------- */
  const cover = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 1600 },
      children: [
        new TextRun({
          text: 'AI Governance Maturity Assessment',
          size: 48,
          bold: true,
          color: ACCENT,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 480 },
      children: [
        new TextRun({
          text: 'Self-Assessment Report',
          size: 24,
          color: INK_500,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 480 },
      children: [
        new TextRun({ text: 'Assessment: ', bold: true }),
        new TextRun({ text: ma.name }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ text: 'Assessor: ', bold: true }),
        new TextRun({ text: ma.assessorName || '(not specified)' }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ text: 'Date: ', bold: true }),
        new TextRun({ text: ma.assessmentDate || today }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 240 },
      children: [
        new TextRun({
          text: `Status: ${ma.status}`,
          italics: true,
          color: INK_500,
        }),
      ],
    }),
  ];

  /* ---- Summary -------------------------------------------------- */
  const summary = [
    h('Executive Summary'),
    p(
      `Overall maturity: ${overallScore.toFixed(1)} / 5.0 — ${maturityLabel(overallScore)}`,
      { bold: true },
    ),
    p(
      'The table below summarises the average maturity score across all eight governance domains.',
    ),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            headerCell('Domain', 60),
            headerCell('Score', 20),
            headerCell('Level', 20),
          ],
        }),
        ...domains.map((d) => {
          const avg = domainAverage(ma.scores, d.key);
          return new TableRow({
            children: [
              textCell(d.title, 60),
              textCell(avg.toFixed(1), 20),
              textCell(maturityLabel(avg), 20),
            ],
          });
        }),
        new TableRow({
          children: [
            headerCell('Overall', 60),
            headerCell(overallScore.toFixed(1), 20),
            headerCell(maturityLabel(overallScore), 20),
          ],
        }),
      ],
    }),
    new Paragraph({ spacing: { after: 120 }, children: [] }),
  ];

  /* ---- Per-domain detail ---------------------------------------- */
  const domainDetail: Paragraph[] = [];
  domains.forEach((d) => {
    const avg = domainAverage(ma.scores, d.key);
    domainDetail.push(h(d.title));
    domainDetail.push(
      p(`Domain average: ${avg.toFixed(1)} — ${maturityLabel(avg)}`, {
        bold: true,
      }),
    );
    d.questions.forEach((q, qi) => {
      const score = ma.scores[`${d.key}.q${qi}`] ?? 1;
      domainDetail.push(
        p(`Q${qi + 1}: ${q}`, { bold: true }),
      );
      domainDetail.push(
        p(`Score: ${score} — ${MATURITY_LABELS[score] ?? 'Initial'}`),
      );
    });
  });

  /* ---- Action plan ---------------------------------------------- */
  const actionPlanSection: (Paragraph | Table)[] = [h('Action Plan')];
  if (ma.actionItems.length === 0) {
    actionPlanSection.push(
      p('No action items have been captured.', { italic: true }),
    );
  } else {
    actionPlanSection.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            children: [
              headerCell('Domain', 25),
              headerCell('Action', 35),
              headerCell('Priority', 15),
              headerCell('Target Date', 25),
            ],
          }),
          ...ma.actionItems.map(
            (item) =>
              new TableRow({
                children: [
                  textCell(item.domain, 25),
                  textCell(item.action, 35),
                  textCell(item.priority, 15),
                  textCell(item.targetDate || '—', 25),
                ],
              }),
          ),
        ],
      }),
    );
  }

  return new Document({
    creator: 'AI Governance Toolkit',
    title: `Maturity Assessment — ${ma.name}`,
    description:
      'AI Governance Maturity Self-Assessment generated by AI Governance Toolkit.',
    sections: [
      {
        headers: { default: headerObj },
        footers: { default: footerObj },
        children: [
          ...cover,
          ...summary,
          ...domainDetail,
          ...actionPlanSection,
        ],
      },
    ],
  });
}

export async function downloadMaturityWord(
  ma: MaturityAssessment,
  domains: Domain[],
) {
  const doc = generateMaturityDocx(ma, domains);
  const blob = await Packer.toBlob(doc);
  if (typeof document === 'undefined') return;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Maturity-${ma.name.replace(/\s+/g, '-')}-${new Date().toISOString().slice(0, 10)}.docx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
