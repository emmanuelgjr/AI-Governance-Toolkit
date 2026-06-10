/**
 * Responsible-AI templates: Ethics Code, Risk Appetite Statement,
 * Human Oversight Specification.
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

export async function generateEthicsCode(outDir: string): Promise<void> {
  const doc = makeDoc('AI Ethics Code', [
    title('AI Ethics Code'),
    subtitle('[ORGANIZATION NAME]'),
    spacer(),
    ...documentControl('AI Ethics Code', [
      'Executive Sponsor',
      'Chief Data / AI Officer',
      'Head of HR',
      'General Counsel',
    ]),

    heading('2. Why This Code Exists'),
    para('[STATE THE ORGANIZATION’S POSITION — e.g., "We use AI to serve our customers and employees. We will not use it in ways that undermine their dignity, autonomy, or rights. This code translates that commitment into behavior we can be held to."]'),
    italic('Keep this section short and in your own voice. A code that reads like boilerplate will be treated like boilerplate.'),
    spacer(),

    heading('3. Principles and What They Mean in Practice'),

    para('3.1 Accountability', true),
    bullet('Every AI system has a named business owner. "The model decided" is never an acceptable explanation.'),
    bullet('Decisions above [defined impact threshold] are traceable to a person who can explain and reverse them.'),

    para('3.2 Fairness', true),
    bullet('Systems that affect individuals are tested for disparate performance across [defined groups] before deployment and at least [annually] after.'),
    bullet('When disparities are found, we remediate, constrain the use case, or retire the system — and we document which.'),

    para('3.3 Transparency', true),
    bullet('People are told when they are interacting with AI, and when AI materially influenced a decision about them.'),
    bullet('We maintain model cards for systems above [risk tier] and can explain system behavior to regulators and affected individuals at an appropriate level of detail.'),

    para('3.4 Human Oversight', true),
    bullet('Consequential decisions retain meaningful human review — a person with the competence, information, time, and authority to disagree with the system.'),
    bullet('Override and shutdown paths exist for every production system (see Human Oversight Specification).'),

    para('3.5 Privacy and Data Stewardship', true),
    bullet('Personal data is used for AI only with a lawful basis, and never repurposed for training without assessment and, where required, consent.'),
    bullet('We honor data subject rights including those specific to automated decision-making (see Data Subject Rights Procedure).'),

    para('3.6 Safety and Security', true),
    bullet('Systems are tested against misuse and adversarial behavior proportionate to their risk tier before exposure to users.'),
    bullet('We report and learn from AI incidents and near-misses without blame for good-faith reporting.'),

    para('3.7 Sustainability', true),
    bullet('Compute-intensive AI choices consider energy and environmental cost; we prefer the smallest system that meets the need.'),
    spacer(),

    heading('4. The Decision Test'),
    para('Before deploying or materially changing an AI use, owners answer:'),
    bullet('Would we be comfortable explaining this use, in plain language, to the people it affects?'),
    bullet('If the system is wrong about someone, will we notice, and can they appeal to a human?'),
    bullet('Does the benefit justify the worst credible harm?'),
    para('If any answer is "no" or "unsure", the use case goes to the AI Governance Committee before proceeding.'),
    spacer(),

    heading('5. Raising Concerns'),
    para('Anyone may raise an AI ethics concern to [named channel — e.g., ethics mailbox, ombudsperson, anonymous hotline]. Concerns are triaged within [X business days]. Retaliation for good-faith reporting is itself a violation of this code.'),
    spacer(),

    heading('6. Governance'),
    para('This code is owned by [the AI Governance Committee], reviewed [annually], and applies to all workforce members and to third parties acting on our behalf. Violations are handled under [the disciplinary policy].'),
    italic('Alignment: ISO/IEC 42001 Clause 5.2 (AI policy) and Annex A.2; informs the objectives set under Clause 6.2.'),
  ]);
  await saveDocx(doc, outDir, 'ai-ethics-code.docx');
}

export async function generateRiskAppetite(outDir: string): Promise<void> {
  const doc = makeDoc('AI Risk Appetite Statement', [
    title('AI Risk Appetite Statement'),
    subtitle('[ORGANIZATION NAME]'),
    spacer(),
    ...documentControl('AI Risk Appetite Statement', [
      'Board Risk Committee Chair',
      'Chief Risk Officer',
      'Accountable Executive for AI',
    ]),

    heading('2. Purpose'),
    para('This statement defines how much AI-related risk [ORGANIZATION] is willing to accept in pursuit of its objectives, and the thresholds that trigger escalation. It calibrates decisions made in the AI Risk Register, the intake process, and the governance committee.'),
    italic('Alignment: ISO/IEC 42001 Clause 6.1 (actions to address risks and opportunities). Scores below refer to the register’s 1–5 likelihood × 1–5 impact scale (1–25).'),
    spacer(),

    heading('3. Appetite by Risk Category'),
    simpleTable(
      ['Category', 'Appetite', 'Statement'],
      [
        ['Bias / fairness', '[Minimal]', '[e.g., "No appetite for unmitigated disparate impact in decisions affecting individuals’ rights or livelihoods."]'],
        ['Privacy', '[Minimal]', '[e.g., "No appetite for processing personal data in AI without a lawful basis and completed assessment."]'],
        ['Security', '[Low]', '[e.g., "Low appetite for AI systems exposed to untrusted input without adversarial testing."]'],
        ['Operational', '[Moderate]', '[e.g., "Moderate appetite for automation of internal processes with human fallback."]'],
        ['Reputational', '[Low]', '[Statement]'],
        ['Regulatory', '[Minimal]', '[e.g., "No appetite for knowingly operating outside EU AI Act / sectoral obligations."]'],
        ['Strategic', '[Moderate–High]', '[e.g., "Willing to accept experimentation risk in contained pilots."]'],
        ['Third-party', '[Low]', '[e.g., "Low appetite for critical dependence on unassessed AI vendors."]'],
      ],
    ),
    spacer(),

    heading('4. Quantitative Thresholds'),
    simpleTable(
      ['Residual score', 'Meaning', 'Required action'],
      [
        ['1–4', 'Within appetite', 'Owner manages; routine review'],
        ['5–9', 'Tolerance zone', 'Treatment plan required; [AI Risk Officer] sign-off'],
        ['10–14', 'Above appetite', 'Committee approval required to operate; time-bound treatment'],
        ['15–25', 'Outside tolerance', 'Not acceptable. Suspend or do not deploy until reduced; Board notified'],
      ],
    ),
    para('Category-specific overrides', true),
    bullet('[e.g., Any Privacy or Bias risk scoring ≥ 10 escalates to the Board regardless of treatment status.]'),
    bullet('[e.g., No system may go live with an untreated Security risk ≥ 8.]'),
    spacer(),

    heading('5. Breach Handling'),
    para('When a risk is discovered above the thresholds in §4: the owner notifies [the AI Risk Officer] within [2 business days]; an interim decision (operate / restrict / suspend) is made by [the Accountable Executive] within [5 business days]; the breach and decision are recorded in the register and reported at the next committee meeting.'),
    spacer(),

    heading('6. Review'),
    para('Reviewed [annually] by the Board Risk Committee, and after any material incident, regulatory change, or strategic shift in AI use.'),
  ]);
  await saveDocx(doc, outDir, 'ai-risk-appetite.docx');
}

export async function generateOversightSpec(outDir: string): Promise<void> {
  const doc = makeDoc('Human Oversight Specification', [
    title('Human Oversight Specification'),
    subtitle('[AI SYSTEM NAME] — [VERSION]'),
    spacer(),
    ...documentControl('Human Oversight Specification', [
      'System Business Owner',
      'AI Risk Officer',
      '[Compliance / DPO where personal data is involved]',
    ]),

    heading('2. System Identification'),
    simpleTable(
      ['Field', 'Value'],
      [
        ['System name and inventory ID', ''],
        ['Risk tier (internal / EU AI Act)', ''],
        ['Decision(s) the system makes or influences', ''],
        ['Population affected', ''],
        ['Volume ([decisions/day])', ''],
      ],
    ),
    spacer(),

    heading('3. Oversight Model'),
    para('Select and justify one per decision type:', true),
    simpleTable(
      ['Model', 'Definition', 'Appropriate when'],
      [
        ['Human-in-the-loop (HITL)', 'A person approves each output before it takes effect', 'High-impact individual decisions; low volume'],
        ['Human-on-the-loop (HOTL)', 'System acts; a person monitors and can intervene in near-real time', 'Moderate impact; volumes too high for per-item review'],
        ['Human-in-command (HIC)', 'A person sets bounds and reviews aggregate behavior; no per-item review', 'Low-impact, reversible, high-volume decisions'],
      ],
    ),
    para('Selected model and rationale', true),
    para('[MODEL + WHY IT MATCHES THE RISK. EU AI Act Article 14 requires oversight be effective, not nominal — the rationale should explain why a person can realistically catch failures at the chosen volume.]'),
    spacer(),

    heading('4. Reviewer Competence and Conditions'),
    bullet('Reviewer role(s): [WHO]. Required training: [WHAT, including automation-bias awareness].'),
    bullet('Information shown to the reviewer: [inputs, model output, confidence/uncertainty signals, key factors].'),
    bullet('Time budget per review: [X minutes] — if actual time falls below [threshold], oversight is deemed degraded and flagged.'),
    bullet('Authority: reviewers can reject or modify output without managerial approval, and rejection rates are NOT used as a negative performance metric.'),
    spacer(),

    heading('5. Intervention Mechanisms'),
    simpleTable(
      ['Mechanism', 'Who can trigger', 'Effect', 'Tested'],
      [
        ['Per-item override', '[Reviewer]', 'Replaces system output', '[date]'],
        ['Pause queue / degrade to manual', '[Team lead]', 'Stops automated processing', '[date]'],
        ['Full system shutdown', '[Owner / CISO / on-call]', 'System offline; fallback process activates', '[date]'],
      ],
    ),
    para('Fallback process when the system is paused: [DESCRIBE THE MANUAL PATH AND ITS CAPACITY].'),
    spacer(),

    heading('6. Countering Automation Bias'),
    bullet('[e.g., Blind-review sampling: X% of items reviewed without seeing the model’s recommendation first.]'),
    bullet('[e.g., Injected known-wrong cases to verify reviewers catch them; results reported quarterly.]'),
    bullet('[e.g., Rotation so no reviewer spends more than X hours/day on queue review.]'),
    spacer(),

    heading('7. Logging and Evidence'),
    para('For each overseen decision, retain: [input reference, model output, reviewer identity, action taken, timestamp]. Retention: [period]. These records evidence oversight effectiveness for audits and, where applicable, EU AI Act Article 14 and ISO/IEC 42001 Annex A.9.'),
    spacer(),

    heading('8. Effectiveness Review'),
    para('[Quarterly], the owner reviews: override rates and reasons, missed-failure analysis from incidents, blind-review results, and reviewer feedback. Material degradation triggers a re-assessment of the oversight model.'),
  ]);
  await saveDocx(doc, outDir, 'human-oversight-spec.docx');
}
