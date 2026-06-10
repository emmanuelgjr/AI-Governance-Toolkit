/**
 * Program reporting templates: Quarterly AI Governance Report (docx)
 * and Board AI Update Deck (pptx).
 */

import { join } from 'node:path';
import { createRequire } from 'node:module';
import type PptxGenJS from 'pptxgenjs';

// pptxgenjs ships CJS; the ESM default import is not a constructor under tsx.
const require = createRequire(import.meta.url);
const pptxgen: typeof PptxGenJS = require('pptxgenjs');
import {
  heading,
  para,
  italic,
  bullet,
  title,
  subtitle,
  spacer,
  simpleTable,
  documentControl,
  makeDoc,
  saveDocx,
  PURPLE,
  GRAY,
} from '../lib/docx-helpers';

export async function generateQuarterlyReport(outDir: string): Promise<void> {
  const doc = makeDoc('Quarterly AI Governance Report', [
    title('Quarterly AI Governance Report'),
    subtitle('[ORGANIZATION NAME] — Q[X] [YYYY]'),
    spacer(),
    ...documentControl('Quarterly AI Governance Report', [
      'Accountable Executive for AI',
      'AI Risk Officer',
    ]),

    heading('2. Executive Summary'),
    para('[FIVE SENTENCES MAXIMUM: program health, the one number that moved most, the most important risk, the most important decision needed. Write this last.]'),
    spacer(),

    heading('3. AI Inventory Movement'),
    simpleTable(
      ['Metric', 'Last quarter', 'This quarter', 'Direction'],
      [
        ['Total systems in inventory', '', '', ''],
        ['In production', '', '', ''],
        ['High-risk / EU AI Act high-risk', '', '', ''],
        ['New this quarter', '', '', '[list in appendix]'],
        ['Retired this quarter', '', '', ''],
        ['Systems past review date', '', '', '[target: 0]'],
      ],
    ),
    spacer(),

    heading('4. Risk Register Movement'),
    simpleTable(
      ['Metric', 'Last quarter', 'This quarter'],
      [
        ['Open risks (total / above appetite)', '', ''],
        ['New risks raised', '', ''],
        ['Risks closed', '', ''],
        ['Treatments past due', '', ''],
      ],
    ),
    para('Top risks this quarter', true),
    simpleTable(
      ['Risk', 'Residual score', 'Treatment status', 'Owner'],
      [['[title]', '', '', ''], ['[title]', '', '', ''], ['[title]', '', '', '']],
    ),
    spacer(),

    heading('5. Impact Assessments and Intake'),
    simpleTable(
      ['Metric', 'This quarter'],
      [
        ['Intake requests received / approved / rejected', ''],
        ['AIIAs completed', ''],
        ['High-risk systems lacking a current AIIA', '[target: 0]'],
      ],
    ),
    spacer(),

    heading('6. Incidents and Near-Misses'),
    simpleTable(
      ['ID', 'Type', 'Severity', 'Status', 'Key lesson'],
      [['', '', '', '', ''], ['', '', '', '', '']],
    ),
    para('[IF ZERO INCIDENTS WERE REPORTED, SAY WHETHER YOU BELIEVE THAT — a quarter with no AI near-misses usually means under-reporting, not perfection.]'),
    spacer(),

    heading('7. Third Parties'),
    simpleTable(
      ['Metric', 'This quarter'],
      [
        ['Vendor assessments completed', ''],
        ['Vendors with critical red flags', ''],
        ['Vendor incidents / material changes (e.g., silent model swaps)', ''],
      ],
    ),
    spacer(),

    heading('8. Training and Awareness'),
    simpleTable(
      ['Metric', 'This quarter'],
      [['% workforce current on AI AUP training', ''], ['Role-based training for reviewers/operators', '']],
    ),
    spacer(),

    heading('9. Regulatory Horizon'),
    bullet('[CHANGE + WHAT IT MEANS FOR US + ACTION — e.g., new EU AI Act guidance, sectoral expectations]'),
    spacer(),

    heading('10. Decisions Requested'),
    simpleTable(
      ['#', 'Decision', 'Options', 'Recommendation'],
      [['1', '', '', ''], ['2', '', '', '']],
    ),
    spacer(),

    heading('11. Next Quarter Priorities'),
    bullet('[Priority 1 — owner — measurable outcome]'),
    bullet('[Priority 2]'),
    bullet('[Priority 3]'),
    italic('Alignment: structured to feed the ISO/IEC 42001 Clause 9.3 management review — inputs map to 9.3.2 (status of actions, changes, performance, opportunities for improvement).'),
  ]);
  await saveDocx(doc, outDir, 'quarterly-ai-governance-report.docx');
}

const INK = '0F172A';

export async function generateBoardDeck(outDir: string): Promise<void> {
  const pres = new pptxgen();
  pres.layout = 'LAYOUT_16x9';
  pres.author = 'AI Governance Toolkit';
  pres.title = 'Board AI Update';

  const FOOT = {
    x: 0.4,
    y: 5.25,
    w: 9.2,
    h: 0.3,
    fontSize: 8,
    color: '6B7280',
    text: 'AI Governance Toolkit · Board AI Update Deck · CC-BY 4.0',
  };

  const titleOpts = { x: 0.4, y: 0.3, w: 9.2, h: 0.6, fontSize: 24, bold: true, color: PURPLE, fontFace: 'Inter' } as const;
  const bodyOpts = { x: 0.4, y: 1.1, w: 9.2, fontSize: 13, color: INK, fontFace: 'Inter' } as const;

  const addFooter = (s: PptxGenJS.Slide) => s.addText(FOOT.text, FOOT);

  // 1 — Title
  let s = pres.addSlide();
  s.addText('AI Program Update', { x: 0.6, y: 1.8, w: 8.8, h: 0.9, fontSize: 36, bold: true, color: PURPLE, fontFace: 'Inter' });
  s.addText('[ORGANIZATION NAME] · Board of Directors · [DATE]', { x: 0.6, y: 2.7, w: 8.8, h: 0.5, fontSize: 16, color: GRAY, fontFace: 'Inter' });
  s.addText('Presented by [ACCOUNTABLE EXECUTIVE]', { x: 0.6, y: 3.2, w: 8.8, h: 0.4, fontSize: 12, color: GRAY, fontFace: 'Inter' });
  addFooter(s);

  // 2 — The one-slide story
  s = pres.addSlide();
  s.addText('If you read one slide, read this one', titleOpts);
  s.addText(
    [
      { text: '[THREE BULLETS. What changed, what worries us, what we need from the board. Everything after this slide is supporting detail.]', options: { bullet: true } },
      { text: '[e.g., "AI use grew 40% this quarter; governance coverage kept pace — 100% of high-risk systems assessed."]', options: { bullet: true } },
      { text: '[e.g., "We need a decision on X (slide 9)."]', options: { bullet: true } },
    ],
    { ...bodyOpts, h: 3.5 },
  );
  addFooter(s);

  // 3 — Program snapshot
  s = pres.addSlide();
  s.addText('AI program snapshot', titleOpts);
  s.addTable(
    [
      [{ text: 'Indicator', options: { bold: true, fill: { color: PURPLE }, color: 'FFFFFF' } }, { text: 'Now', options: { bold: true, fill: { color: PURPLE }, color: 'FFFFFF' } }, { text: 'Last update', options: { bold: true, fill: { color: PURPLE }, color: 'FFFFFF' } }, { text: 'Trend', options: { bold: true, fill: { color: PURPLE }, color: 'FFFFFF' } }],
      ['AI systems in production', '[n]', '[n]', '[↑/→/↓]'],
      ['High-risk systems (internal tier)', '[n]', '[n]', ''],
      ['High-risk with current impact assessment', '[%]', '[%]', ''],
      ['Open risks above appetite', '[n]', '[n]', ''],
      ['Staff current on AI training', '[%]', '[%]', ''],
    ],
    { x: 0.4, y: 1.1, w: 9.2, fontSize: 12, fontFace: 'Inter', color: INK, border: { type: 'solid', color: 'E2E8F0', pt: 1 } },
  );
  addFooter(s);

  // 4 — Where AI is used
  s = pres.addSlide();
  s.addText('Where we use AI today', titleOpts);
  s.addText(
    [
      { text: '[MAP USE TO BUSINESS OUTCOMES, NOT TECHNOLOGY. 4–6 bullets: function → use → value → risk tier.]', options: { bullet: true } },
      { text: '[e.g., "Customer service: drafting agent responses (human-reviewed) — 30% faster handling — Moderate risk."]', options: { bullet: true } },
    ],
    { ...bodyOpts, h: 3.5 },
  );
  addFooter(s);

  // 5 — Top risks
  s = pres.addSlide();
  s.addText('Top AI risks and what we are doing', titleOpts);
  s.addTable(
    [
      [{ text: 'Risk', options: { bold: true, fill: { color: PURPLE }, color: 'FFFFFF' } }, { text: 'Residual', options: { bold: true, fill: { color: PURPLE }, color: 'FFFFFF' } }, { text: 'Treatment', options: { bold: true, fill: { color: PURPLE }, color: 'FFFFFF' } }, { text: 'On track?', options: { bold: true, fill: { color: PURPLE }, color: 'FFFFFF' } }],
      ['[Risk 1 — in business language]', '[score]', '[action]', '[Y/N]'],
      ['[Risk 2]', '', '', ''],
      ['[Risk 3]', '', '', ''],
    ],
    { x: 0.4, y: 1.1, w: 9.2, fontSize: 12, fontFace: 'Inter', color: INK, border: { type: 'solid', color: 'E2E8F0', pt: 1 } },
  );
  s.addText('[State plainly if any risk sits outside appetite and why we are still operating.]', { ...bodyOpts, y: 3.6, h: 0.8, italic: true, color: GRAY });
  addFooter(s);

  // 6 — Incidents
  s = pres.addSlide();
  s.addText('Incidents and near-misses', titleOpts);
  s.addText(
    [
      { text: '[COUNT, SEVERITY MIX, ONE-LINE LESSONS. Near-misses included deliberately — they are the cheapest learning available.]', options: { bullet: true } },
      { text: '[If zero: state the reporting channels and why we trust the zero.]', options: { bullet: true } },
    ],
    { ...bodyOpts, h: 3.5 },
  );
  addFooter(s);

  // 7 — Regulatory
  s = pres.addSlide();
  s.addText('Regulatory and standards horizon', titleOpts);
  s.addText(
    [
      { text: '[WHAT CHANGED / WHAT IS COMING → WHAT IT MEANS FOR US → WHAT WE ARE DOING. EU AI Act milestones, sectoral guidance, ISO/IEC 42001 certification posture.]', options: { bullet: true } },
    ],
    { ...bodyOpts, h: 3.5 },
  );
  addFooter(s);

  // 8 — Maturity
  s = pres.addSlide();
  s.addText('Governance maturity', titleOpts);
  s.addText(
    [
      { text: '[CURRENT MATURITY vs TARGET, from the Maturity Self-Assessment. Show the 2–3 domains you are deliberately investing in — claiming uniform excellence reads as not measuring.]', options: { bullet: true } },
    ],
    { ...bodyOpts, h: 3.5 },
  );
  addFooter(s);

  // 9 — Decisions requested
  s = pres.addSlide();
  s.addText('Decisions requested', titleOpts);
  s.addTable(
    [
      [{ text: '#', options: { bold: true, fill: { color: PURPLE }, color: 'FFFFFF' } }, { text: 'Decision', options: { bold: true, fill: { color: PURPLE }, color: 'FFFFFF' } }, { text: 'Recommendation', options: { bold: true, fill: { color: PURPLE }, color: 'FFFFFF' } }],
      ['1', '[decision needed]', '[recommendation + cost]'],
      ['2', '', ''],
    ],
    { x: 0.4, y: 1.1, w: 9.2, fontSize: 12, fontFace: 'Inter', color: INK, border: { type: 'solid', color: 'E2E8F0', pt: 1 } },
  );
  addFooter(s);

  // 10 — Appendix marker
  s = pres.addSlide();
  s.addText('Appendix', titleOpts);
  s.addText(
    [
      { text: 'Full inventory listing (from the AI Inventory Excel export)', options: { bullet: true } },
      { text: 'Risk register extract (from the Risk Register Excel export)', options: { bullet: true } },
      { text: 'Incident summaries', options: { bullet: true } },
      { text: 'Glossary for board members', options: { bullet: true } },
    ],
    { ...bodyOpts, h: 3.5 },
  );
  addFooter(s);

  await pres.writeFile({ fileName: join(outDir, 'board-ai-update-deck.pptx') });
  console.log('  ✓ board-ai-update-deck.pptx');
}
