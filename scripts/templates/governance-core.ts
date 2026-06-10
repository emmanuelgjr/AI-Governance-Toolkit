/**
 * Core governance templates: Charter, Acceptable Use Policy,
 * Use-Case Intake Form, Model Card.
 */

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
} from '../lib/docx-helpers';
import { HeadingLevel } from 'docx';

const H2 = HeadingLevel.HEADING_2;

export async function generateCharter(outDir: string): Promise<void> {
  const doc = makeDoc('AI Governance Charter', [
    title('AI Governance Charter'),
    subtitle('[ORGANIZATION NAME]'),
    spacer(),
    ...documentControl('AI Governance Charter', [
      'Executive Sponsor (CEO / COO)',
      'Chief Information Security Officer',
      'Chief Data / AI Officer',
      'General Counsel',
    ]),

    heading('2. Purpose and Mandate'),
    para('[STATE WHY THIS BODY EXISTS — e.g., "The AI Governance Committee directs and oversees the responsible development, procurement, deployment, and retirement of AI systems across [ORGANIZATION], consistent with our risk appetite, legal obligations, and the requirements of ISO/IEC 42001."]'),
    italic('Alignment: ISO/IEC 42001 Clause 5.1 (leadership and commitment), Clause 5.2 (AI policy), Clause 4 (context of the organization).'),
    spacer(),

    heading('3. Scope of the AI Management System'),
    para('[DEFINE WHAT IS IN AND OUT OF SCOPE. Be specific: business units, geographies, system types. The AIMS scope statement required by Clause 4.3 can be reproduced or referenced here.]'),
    bullet('In scope: [e.g., all AI systems processing customer or employee data; all generative AI tools used by staff; vendor AI embedded in procured software]'),
    bullet('Out of scope: [e.g., pure research prototypes never exposed to production data — justify every exclusion]'),
    spacer(),

    heading('4. Governance Structure'),
    simpleTable(
      ['Body / Role', 'Mandate', 'Cadence'],
      [
        ['AI Governance Committee', 'Approves AI policy, risk appetite, high-risk deployments; reviews incidents and KPIs', '[Monthly]'],
        ['Accountable Executive', 'Single named owner of the AIMS; reports to board', 'Standing'],
        ['AI Risk Officer / 2nd line', 'Maintains risk register, challenges first-line assessments', 'Standing'],
        ['System Owners (1st line)', 'Inventory accuracy, impact assessments, control operation for their systems', 'Standing'],
        ['Internal Audit (3rd line)', 'Independent assurance over the AIMS', '[Annual]'],
      ],
    ),
    spacer(),

    heading('5. Decision Rights and Escalation'),
    simpleTable(
      ['Decision', 'Decided by', 'Escalated to'],
      [
        ['Approve new high-risk AI use case', 'AI Governance Committee', 'Executive / Board'],
        ['Approve limited/minimal-risk use case', 'System Owner + AI Risk Officer', 'Committee'],
        ['Accept a residual risk above appetite', 'Committee (documented)', 'Board'],
        ['Suspend a production AI system', 'Accountable Executive or CISO', '—'],
        ['Approve exceptions to the AI policy', 'Committee', 'Executive'],
      ],
    ),
    italic('Tie thresholds to the AI Risk Appetite Statement and the risk register scoring scale (likelihood × impact, 1–25).'),
    spacer(),

    heading('6. Meetings and Quorum'),
    bullet('Cadence: [monthly], with extraordinary sessions for incidents rated [High] or above.'),
    bullet('Quorum: [majority of voting members, including the Accountable Executive or delegate].'),
    bullet('Standing agenda: inventory changes, risk register movements, incident review, policy exceptions, regulatory horizon, KPI dashboard.'),
    bullet('Minutes and decisions are documented information under ISO/IEC 42001 Clause 7.5.'),
    spacer(),

    heading('7. Reporting and Key Indicators'),
    para('The committee reports to [the board risk committee] [quarterly]. Minimum indicators:'),
    bullet('AI systems in inventory, by lifecycle stage and risk tier'),
    bullet('% of high-risk systems with a completed impact assessment'),
    bullet('Open risks above appetite, with treatment status'),
    bullet('AI incidents and near-misses, with time-to-containment'),
    bullet('% of staff completing AI acceptable-use training'),
    spacer(),

    heading('8. Review'),
    para('This charter is reviewed at least annually and after any material change to the organization, its AI use, or applicable regulation (ISO/IEC 42001 Clause 9.3 management review inputs).'),
  ]);
  await saveDocx(doc, outDir, 'ai-governance-charter.docx');
}

export async function generateAup(outDir: string): Promise<void> {
  const doc = makeDoc('AI Acceptable Use Policy', [
    title('AI Acceptable Use Policy'),
    subtitle('[ORGANIZATION NAME]'),
    spacer(),
    ...documentControl('AI Acceptable Use Policy', [
      'Chief Information Security Officer',
      'Head of HR',
      'General Counsel',
    ]),

    heading('2. Purpose and Scope'),
    para('This policy defines how workforce members may and may not use AI tools. It applies to [all employees, contractors, and third parties acting on the organization’s behalf], on any device, when handling organizational data or acting in an organizational capacity.'),
    italic('Alignment: ISO/IEC 42001 Annex A.2 (AI policy), EU AI Act Article 4 (AI literacy). Pair this policy with role-based training.'),
    spacer(),

    heading('3. Approved AI Tools'),
    para('Only tools on the approved register may process organizational data. The register is maintained by [IT / Security] and reviewed [quarterly].'),
    simpleTable(
      ['Tool', 'Approved tier', 'Permitted data classes', 'Conditions'],
      [
        ['[e.g., Enterprise LLM tenant]', 'Approved', '[Internal, Confidential]', '[SSO required; logging on]'],
        ['[e.g., Public chatbot — free tier]', 'Restricted', '[Public only]', '[No customer or employee data]'],
        ['[Tool name]', 'Prohibited', '—', '[Reason]'],
      ],
    ),
    spacer(),

    heading('4. Permitted Uses'),
    bullet('Drafting and summarizing internal documents using approved tools and the permitted data classes.'),
    bullet('Code assistance, provided generated code passes the same review and testing gates as human-written code.'),
    bullet('Research and ideation that involves no confidential, personal, or client data.'),
    spacer(),

    heading('5. Prohibited Uses'),
    bullet('Entering confidential, personal, client, or regulated data into any tool not approved for that data class.'),
    bullet('Using AI output as the sole basis for decisions with legal or similarly significant effects on individuals (credit, employment, housing) without the human review required by the Human Oversight Specification.'),
    bullet('Representing AI-generated content as human work where attribution is required, or vice versa.'),
    bullet('Using AI tools to generate content that violates [the code of conduct / law], including harassment or discriminatory material.'),
    bullet('Circumventing security controls, including pasting data through personal accounts to evade tool restrictions.'),
    spacer(),

    heading('6. Data Handling Rules'),
    simpleTable(
      ['Data classification', 'Approved-tier tools', 'Restricted-tier tools'],
      [
        ['Public', 'Yes', 'Yes'],
        ['Internal', 'Yes', 'No'],
        ['Confidential', '[Yes, with conditions]', 'No'],
        ['Personal data', '[Only where a lawful basis and DPA exist]', 'No'],
        ['Regulated (e.g., PHI, PCI)', '[Prohibited unless explicitly approved]', 'No'],
      ],
    ),
    spacer(),

    heading('7. Verification and Accountability'),
    para('You are accountable for what you do with AI output. Verify factual claims, citations, calculations, and code before relying on them. AI tools fabricate plausible content; treat output as a draft from an unverified source.'),
    spacer(),

    heading('8. New Tools and Exceptions'),
    para('Requests for new tools or use cases go through the AI Use-Case Intake Form. Exceptions to this policy require [AI Governance Committee] approval, are time-bound, and are logged.'),
    spacer(),

    heading('9. Enforcement'),
    para('Violations are handled under [the disciplinary policy]. Suspected incidents involving AI tools must be reported to [security contact] per the AI Incident Response Plan.'),
    spacer(),

    heading('10. Acknowledgment'),
    para('I have read and understood this policy.', true),
    simpleTable(['Name', 'Role', 'Signature', 'Date'], [['', '', '', ''], ['', '', '', '']]),
  ]);
  await saveDocx(doc, outDir, 'ai-acceptable-use-policy.docx');
}

export async function generateIntakeForm(outDir: string): Promise<void> {
  const doc = makeDoc('AI Use-Case Intake Form', [
    title('AI Use-Case Intake Form'),
    subtitle('[ORGANIZATION NAME] — submit to [AI governance mailbox / workflow]'),
    spacer(),

    heading('1. Requestor'),
    simpleTable(
      ['Field', 'Response'],
      [
        ['Requestor name and role', ''],
        ['Business unit', ''],
        ['Proposed business owner', ''],
        ['Proposed technical owner', ''],
        ['Date', '[YYYY-MM-DD]'],
      ],
    ),
    spacer(),

    heading('2. Use Case'),
    simpleTable(
      ['Field', 'Response'],
      [
        ['What problem does this solve? (2–3 sentences)', ''],
        ['Who uses it, and who is affected by its outputs?', ''],
        ['Expected benefit ([hours saved / revenue / quality])', ''],
        ['Target go-live date', ''],
      ],
    ),
    spacer(),

    heading('3. System and Data'),
    simpleTable(
      ['Field', 'Response'],
      [
        ['Build, buy, or embedded in existing product?', ''],
        ['Vendor / model (if known)', ''],
        ['Deployment (SaaS API / self-hosted / hybrid)', ''],
        ['Data used as input (categories and sources)', ''],
        ['Personal data involved? (Y/N — if Y, categories)', ''],
        ['Will organizational data train or fine-tune a model?', ''],
        ['Autonomy: read-only / suggest / act with approval / autonomous', ''],
      ],
    ),
    spacer(),

    heading('4. Initial Risk Screening'),
    para('Answer Y/N. Any "Y" routes the use case to a full AI Impact Assessment before approval.', true),
    simpleTable(
      ['#', 'Question', 'Y/N'],
      [
        ['1', 'Does the system make or materially influence decisions about individuals (employment, credit, access to services)?', ''],
        ['2', 'Does it process special-category or otherwise sensitive personal data?', ''],
        ['3', 'Could it plausibly fall in an EU AI Act high-risk category (Annex III) or interact with one?', ''],
        ['4', 'Will outputs be shown to customers or the public without human review?', ''],
        ['5', 'Does it act autonomously on systems of record (writes, transactions, communications)?', ''],
        ['6', 'Is the vendor or model new to the organization (no prior assessment)?', ''],
        ['7', 'Could failure cause safety, legal, or material financial harm?', ''],
        ['8', 'Will it be used by or affect minors or other vulnerable groups?', ''],
      ],
    ),
    spacer(),

    heading('5. Routing and Decision'),
    simpleTable(
      ['Step', 'Outcome', 'By', 'Date'],
      [
        ['Screening reviewed', '[Proceed / AIIA required / Rejected]', '[AI Risk Officer]', ''],
        ['AIIA completed (if required)', '[Reference]', '[System owner]', ''],
        ['Inventory entry created', '[Inventory ID]', '[System owner]', ''],
        ['Decision', '[Approved / Approved with conditions / Rejected]', '[Committee / delegated approver]', ''],
      ],
    ),
    italic('Alignment: ISO/IEC 42001 Clause 8.1 (operational planning), Annex A.6 (AI system life cycle). Approved systems must appear in the AI Inventory before build starts.'),
  ]);
  await saveDocx(doc, outDir, 'ai-intake-form.docx');
}

export async function generateModelCard(outDir: string): Promise<void> {
  const doc = makeDoc('AI Model Card', [
    title('AI Model Card'),
    subtitle('[SYSTEM / MODEL NAME] — [VERSION]'),
    spacer(),

    heading('1. Overview'),
    simpleTable(
      ['Field', 'Value'],
      [
        ['Model / system name', ''],
        ['Version and date', ''],
        ['Owner (business / technical)', ''],
        ['Base model and provenance', '[e.g., fine-tune of (vendor model vX); license]'],
        ['Inventory ID', '[from AI Inventory]'],
        ['Risk tier (internal / EU AI Act)', ''],
      ],
    ),
    spacer(),

    heading('2. Intended Use'),
    para('Intended purpose', true),
    para('[WHAT THIS MODEL IS FOR, IN PLAIN LANGUAGE.]'),
    para('Intended users', true),
    para('[WHO OPERATES IT AND WHO CONSUMES ITS OUTPUT.]'),
    para('Out-of-scope uses', true),
    bullet('[USES THE MODEL WAS NOT DESIGNED OR EVALUATED FOR — be explicit; this section anchors misuse conversations.]'),
    bullet('[e.g., "Not for decisions with legal effect on individuals."]'),
    spacer(),

    heading('3. Training and Evaluation Data'),
    para('[SUMMARIZE SOURCES, COLLECTION PERIOD, KNOWN GAPS. For procured models, record what the vendor discloses and what they decline to disclose.]'),
    simpleTable(
      ['Dataset', 'Role', 'Size', 'Known limitations'],
      [
        ['[name]', '[training / fine-tuning / eval]', '', '[coverage gaps, label quality, age]'],
        ['', '', '', ''],
      ],
    ),
    spacer(),

    heading('4. Performance'),
    para('Report metrics on the evaluation set, overall and per relevant segment. State the metric definition and the evaluation date.'),
    simpleTable(
      ['Metric', 'Overall', '[Segment A]', '[Segment B]', 'Threshold'],
      [
        ['[e.g., accuracy / F1 / groundedness]', '', '', '', '[go-live minimum]'],
        ['[e.g., hallucination rate on eval set]', '', '', '', ''],
      ],
    ),
    spacer(),

    heading('5. Fairness Considerations'),
    para('[WHICH GROUPS WERE ANALYZED, WHICH FAIRNESS METRICS WERE USED (e.g., equalized odds, demographic parity), RESULTS, AND RESIDUAL DISPARITIES. If no fairness analysis was performed, say so and why.]'),
    spacer(),

    heading('6. Limitations and Known Failure Modes'),
    bullet('[e.g., degrades on inputs outside (domain); sensitive to prompt injection; multilingual performance unverified]'),
    bullet('[Known failure modes observed in testing or production]'),
    spacer(),

    heading('7. Operational Profile'),
    simpleTable(
      ['Field', 'Value'],
      [
        ['Monitoring in place', '[metrics, drift detection, alert thresholds]'],
        ['Human oversight model', '[HITL / HOTL / HIC — link Human Oversight Specification]'],
        ['Rollback procedure', '[how to revert to previous version]'],
        ['Update cadence', '[retraining / re-evaluation schedule]'],
      ],
    ),
    spacer(),

    heading('8. Change Log'),
    simpleTable(
      ['Version', 'Date', 'Change', 'Re-evaluated?'],
      [['[1.0]', '', '[Initial release]', '[Y/N]'], ['', '', '', '']],
    ),
    italic('Alignment: ISO/IEC 42001 Annex A.6.2 (system documentation); supports transparency obligations under EU AI Act Article 13 where applicable.'),
  ]);
  await saveDocx(doc, outDir, 'ai-model-card.docx');
}
