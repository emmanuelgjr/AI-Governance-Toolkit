/**
 * generate-templates.ts
 * Generates all 12 downloadable template files into public/templates/.
 *
 * Usage:  npx tsx scripts/generate-templates.ts
 */

import { mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  generateCharter,
  generateAup,
  generateIntakeForm,
  generateModelCard,
} from './templates/governance-core';
import {
  generateEthicsCode,
  generateRiskAppetite,
  generateOversightSpec,
} from './templates/responsible-ai';
import {
  generateIncidentResponsePlan,
  generateDataSubjectRights,
  generateVendorTermination,
} from './templates/operations';
import {
  generateQuarterlyReport,
  generateBoardDeck,
} from './templates/program-reporting';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, '..', 'public', 'templates');
mkdirSync(outDir, { recursive: true });

async function main() {
  console.log('Generating templates...');
  await generateCharter(outDir);
  await generateAup(outDir);
  await generateIntakeForm(outDir);
  await generateModelCard(outDir);
  await generateBoardDeck(outDir);
  await generateQuarterlyReport(outDir);
  await generateEthicsCode(outDir);
  await generateRiskAppetite(outDir);
  await generateOversightSpec(outDir);
  await generateIncidentResponsePlan(outDir);
  await generateDataSubjectRights(outDir);
  await generateVendorTermination(outDir);
  console.log('Done! All 12 templates generated in public/templates/.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
