/**
 * Shared docx building blocks for the template generation scripts.
 * Mirrors the AI-RedTeam-Framework generator pattern, purple-themed.
 */

import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  TextRun,
  WidthType,
  AlignmentType,
  HeadingLevel,
  ShadingType,
  Header,
  Footer,
} from 'docx';

export const PURPLE = '5B21B6';
export const GRAY = '4B5563';
export const FONT = 'Inter';
export const FONT_SIZE = 20; // half-points → 10pt
export const HEADING_SIZE = 28; // 14pt
export const SUBHEADING_SIZE = 24; // 12pt
export const TITLE_SIZE = 40; // 20pt
export const FOOTER_SIZE = 16; // 8pt

export function heading(
  text: string,
  level: (typeof HeadingLevel)[keyof typeof HeadingLevel] = HeadingLevel.HEADING_1,
): Paragraph {
  return new Paragraph({
    heading: level,
    spacing: { before: 240, after: 120 },
    children: [
      new TextRun({
        text,
        bold: true,
        font: FONT,
        size: level === HeadingLevel.HEADING_1 ? HEADING_SIZE : SUBHEADING_SIZE,
        color: PURPLE,
      }),
    ],
  });
}

export function para(text: string, bold = false): Paragraph {
  return new Paragraph({
    spacing: { after: 80 },
    children: [new TextRun({ text, font: FONT, size: FONT_SIZE, bold })],
  });
}

export function italic(text: string): Paragraph {
  return new Paragraph({
    spacing: { after: 80 },
    children: [new TextRun({ text, font: FONT, size: FONT_SIZE, italics: true, color: GRAY })],
  });
}

export function bullet(text: string, level = 0): Paragraph {
  return new Paragraph({
    bullet: { level },
    spacing: { after: 60 },
    children: [new TextRun({ text, font: FONT, size: FONT_SIZE })],
  });
}

export function title(text: string): Paragraph {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 200 },
    children: [new TextRun({ text, bold: true, font: FONT, size: TITLE_SIZE, color: PURPLE })],
  });
}

export function subtitle(text: string): Paragraph {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 120 },
    children: [new TextRun({ text, font: FONT, size: SUBHEADING_SIZE, color: GRAY })],
  });
}

export function spacer(): Paragraph {
  return new Paragraph({ spacing: { after: 200 }, children: [] });
}

export function cell(
  text: string,
  opts: { bold?: boolean; shading?: string; width?: number } = {},
): TableCell {
  return new TableCell({
    width: opts.width ? { size: opts.width, type: WidthType.PERCENTAGE } : undefined,
    shading: opts.shading
      ? { type: ShadingType.SOLID, color: opts.shading, fill: opts.shading }
      : undefined,
    children: [
      new Paragraph({
        spacing: { before: 40, after: 40 },
        children: [
          new TextRun({
            text,
            font: FONT,
            size: FONT_SIZE,
            bold: opts.bold ?? false,
            color: opts.shading === PURPLE ? 'FFFFFF' : undefined,
          }),
        ],
      }),
    ],
  });
}

export function simpleTable(headers: string[], rows: string[][]): Table {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        tableHeader: true,
        children: headers.map((h) => cell(h, { bold: true, shading: PURPLE })),
      }),
      ...rows.map((r) => new TableRow({ children: r.map((c) => cell(c)) })),
    ],
  });
}

/** Standard "Document Control" + approvals block used by every template */
export function documentControl(docTitle: string, approverRoles: string[]): (Paragraph | Table)[] {
  return [
    heading('1. Document Control'),
    simpleTable(
      ['Field', 'Value'],
      [
        ['Document Title', docTitle],
        ['Version', '[1.0]'],
        ['Owner', '[ROLE / NAME]'],
        ['Date', '[YYYY-MM-DD]'],
        ['Classification', '[INTERNAL / CONFIDENTIAL]'],
        ['Next Review Date', '[YYYY-MM-DD — at most 12 months out]'],
      ],
    ),
    spacer(),
    para('Approvals', true),
    simpleTable(
      ['Role', 'Name', 'Signature', 'Date'],
      approverRoles.map((r) => [r, '[NAME]', '', '[YYYY-MM-DD]']),
    ),
    spacer(),
  ];
}

function makeHeader(): Header {
  return new Header({
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text: 'AI GOVERNANCE TOOLKIT',
            font: FONT,
            size: FOOTER_SIZE,
            color: PURPLE,
            bold: true,
          }),
        ],
      }),
    ],
  });
}

function makeFooter(templateName: string): Footer {
  return new Footer({
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text: `AI Governance Toolkit · ${templateName} · CC-BY 4.0 · emmanuelgjr.github.io/AI-Governance-Toolkit`,
            font: FONT,
            size: FOOTER_SIZE,
            color: '6B7280',
          }),
        ],
      }),
    ],
  });
}

export function makeDoc(templateName: string, children: (Paragraph | Table)[]): Document {
  return new Document({
    sections: [
      {
        headers: { default: makeHeader() },
        footers: { default: makeFooter(templateName) },
        children,
      },
    ],
  });
}

export async function saveDocx(doc: Document, outDir: string, filename: string): Promise<void> {
  const buffer = await Packer.toBuffer(doc);
  writeFileSync(join(outDir, filename), buffer);
  console.log(`  ✓ ${filename}`);
}
