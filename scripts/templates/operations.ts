/**
 * Operational templates: AI Incident Response Plan,
 * Data Subject Rights Procedure, Vendor Termination / Transition Plan.
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

export async function generateIncidentResponsePlan(outDir: string): Promise<void> {
  const doc = makeDoc('AI Incident Response Plan', [
    title('AI Incident Response Plan'),
    subtitle('[ORGANIZATION NAME]'),
    spacer(),
    ...documentControl('AI Incident Response Plan', [
      'Chief Information Security Officer',
      'Accountable Executive for AI',
      'General Counsel',
      '[DPO where applicable]',
    ]),

    heading('2. Scope and Definition'),
    para('An AI incident is any event where an AI system’s behavior, use, or compromise causes — or credibly could cause — harm to individuals, the organization, or third parties. This plan extends the enterprise incident response process; it does not replace it.'),
    para('Taxonomy', true),
    simpleTable(
      ['Type', 'Examples'],
      [
        ['Harmful output', 'Defamatory, discriminatory, or dangerous content reaching users; systematic wrong decisions'],
        ['Bias event', 'Detected disparate performance or impact in production'],
        ['Privacy', 'Personal data leaked via output, memorization, or logging; unlawful processing discovered'],
        ['Security', 'Prompt injection with impact, model/data poisoning, model theft, jailbreak enabling misuse'],
        ['Misuse', 'Internal use violating the AUP; shadow AI handling restricted data'],
        ['Supply chain', 'Vendor model outage, silent model change, vendor breach affecting our data'],
      ],
    ),
    spacer(),

    heading('3. Severity'),
    simpleTable(
      ['Level', 'Definition', 'Examples', 'Response clock'],
      [
        ['SEV-1', 'Ongoing harm to individuals, legal/regulatory exposure, or material business impact', 'Discriminatory decisions at scale; personal data exfiltration via model', '[Immediate; exec notified within 1h]'],
        ['SEV-2', 'Significant harm contained or imminent', 'Jailbreak published; harmful outputs to a limited audience', '[Same business day]'],
        ['SEV-3', 'Limited harm, contained', 'Single harmful output caught by review; near-miss', '[Within 3 business days]'],
      ],
    ),
    spacer(),

    heading('4. Roles'),
    simpleTable(
      ['Role', 'Responsibility', 'Named contact'],
      [
        ['Incident Commander', 'Runs the response; severity calls', '[on-call rota]'],
        ['AI System Owner', 'System knowledge; executes containment on the system', '[per inventory]'],
        ['AI/ML SME', 'Model behavior analysis; rollback feasibility', '[name]'],
        ['Legal / Privacy', 'Notification obligations; privilege', '[name]'],
        ['Communications', 'Internal and external comms', '[name]'],
      ],
    ),
    spacer(),

    heading('5. Response Phases'),
    para('5.1 Detect and report', true),
    bullet('Intake channels: [monitoring alerts, user reports, staff reports to (mailbox), vendor notifications].'),
    bullet('Anyone may report; reports are triaged by [role] within [SLA].'),
    para('5.2 Triage', true),
    bullet('Confirm AI involvement, classify type and severity, open incident record, freeze relevant logs and outputs (preserve evidence before remediation changes behavior).'),
    para('5.3 Contain', true),
    bullet('AI-specific containment options, in escalating order: tighten guardrails/filters; constrain inputs; degrade to human-only processing; roll back model version; full shutdown with manual fallback (per Human Oversight Specification §5).'),
    bullet('For vendor systems: invoke [contractual incident clauses]; capture vendor change logs.'),
    para('5.4 Correct and recover', true),
    bullet('Root-cause the failure (data, model, prompt/config, integration, misuse). Re-evaluate before re-enabling: targeted tests demonstrating the failure mode is fixed, not just unobserved.'),
    para('5.5 Learn', true),
    bullet('Blameless post-incident review within [10 business days]; actions tracked to closure; risk register and AIIA updated; detection rules added where feasible.'),
    spacer(),

    heading('6. Notification Triggers'),
    simpleTable(
      ['Obligation', 'Trigger', 'Deadline', 'Owner'],
      [
        ['GDPR Art. 33/34', 'Personal data breach via AI system', '72h to authority', '[DPO]'],
        ['EU AI Act Art. 73', 'Serious incident involving a high-risk AI system', '[Per regulation — verify current timelines]', '[Legal]'],
        ['[Sectoral regulator]', '[e.g., OSFI, NYDFS as applicable]', '[per regime]', '[Compliance]'],
        ['Contractual', 'Client notification clauses', '[per contract]', '[Account owner]'],
      ],
    ),
    italic('Verify deadlines against current regulation at each annual review — they change.'),
    spacer(),

    heading('7. Exercises'),
    para('At least [annually], run a tabletop using an AI-specific scenario (e.g., discovered bias in a production decision system; prompt-injection data leak). Record findings as improvement actions.'),
    italic('Alignment: ISO/IEC 42001 Annex A.8.4; cross-reference AI-CTRL-009 (AI Incident Response) in the AI Controls Catalog for audit test procedures.'),
  ]);
  await saveDocx(doc, outDir, 'ai-incident-response-plan.docx');
}

export async function generateDataSubjectRights(outDir: string): Promise<void> {
  const doc = makeDoc('Data Subject Rights Procedure (for AI)', [
    title('Data Subject Rights Procedure'),
    subtitle('[ORGANIZATION NAME] — AI-specific supplement to the general DSR procedure'),
    spacer(),
    ...documentControl('Data Subject Rights Procedure (for AI)', [
      'Data Protection Officer',
      'Accountable Executive for AI',
      'General Counsel',
    ]),

    heading('2. Purpose and Scope'),
    para('This procedure supplements [the general DSR procedure] for requests touching AI systems — where personal data is used to train, fine-tune, or prompt models, or where AI makes or supports decisions about individuals. It covers systems flagged "personal data involved" in the AI Inventory.'),
    spacer(),

    heading('3. Rights and AI-Specific Fulfillment'),
    simpleTable(
      ['Right', 'AI-specific considerations'],
      [
        ['Access (Art. 15)', 'Search inference logs and stored prompts/outputs, not just databases. Disclose AI involvement in decisions and meaningful information about the logic involved.'],
        ['Rectification (Art. 16)', 'Correct source records AND downstream features/caches. Note where a deployed model was trained on the incorrect data and the remediation chosen.'],
        ['Erasure (Art. 17)', 'Erase from source data, logs, and vector stores. Be honest about model weights: erasure from a trained model is generally infeasible without retraining — document the compensating measures (output suppression, retraining schedule) and the legal analysis.'],
        ['Portability (Art. 20)', 'Provided data and, where applicable, user-generated prompts. Model outputs are assessed case-by-case.'],
        ['Objection (Art. 21)', 'Stop processing for the objected purpose; ensure suppression propagates to training pipelines.'],
        ['Automated decisions (Art. 22)', 'If a decision is solely automated with legal/similar effect: provide human review by someone with authority to change it, allow the individual to contest and express their view, and document the review.'],
      ],
    ),
    italic('The erasure row is deliberately candid — overpromising "we delete it from the model" is a compliance failure waiting to be discovered. State what is technically true.'),
    spacer(),

    heading('4. Intake and Verification'),
    bullet('Channels: [web form, mailbox, postal]. Requests reaching any staff member are forwarded to [DPO mailbox] within [2 business days].'),
    bullet('Identity verification: [method proportionate to data sensitivity]. Do not use an AI system to make the verification decision.'),
    bullet('On receipt, query the AI Inventory for systems processing the requester’s data categories — this is the system-by-system checklist for fulfillment.'),
    spacer(),

    heading('5. Timelines'),
    simpleTable(
      ['Step', 'Deadline'],
      [
        ['Acknowledge request', '[5 business days]'],
        ['Fulfill or explain extension', '1 month (GDPR), extensible by 2 months for complexity — notify within the first month'],
        ['Art. 22 human review completed', '[15 business days]'],
      ],
    ),
    spacer(),

    heading('6. Records'),
    para('Log every request: identity-verification outcome, systems checked (inventory IDs), actions per system, exemptions applied with justification, response sent, dates. Retention: [period]. These records evidence Annex A.7/privacy obligations in audits.'),
    spacer(),

    heading('7. Exemptions'),
    para('[LIST APPLICABLE EXEMPTIONS — legal claims, third-party rights, disproportionate effort — each requires documented legal sign-off before use.]'),
  ]);
  await saveDocx(doc, outDir, 'ai-data-subject-rights.docx');
}

export async function generateVendorTermination(outDir: string): Promise<void> {
  const doc = makeDoc('AI Vendor Termination / Transition Plan', [
    title('AI Vendor Termination / Transition Plan'),
    subtitle('[VENDOR NAME] — [SYSTEM / SERVICE]'),
    spacer(),
    ...documentControl('AI Vendor Termination / Transition Plan', [
      'System Business Owner',
      'Procurement / Vendor Management',
      'CISO or delegate',
      'Legal',
    ]),

    heading('2. Context'),
    simpleTable(
      ['Field', 'Value'],
      [
        ['Vendor and service', ''],
        ['Inventory ID(s) of dependent systems', ''],
        ['Trigger', '[contract end / vendor exit / risk decision / breach / cost]'],
        ['Criticality of the service', '[per BIA]'],
        ['Target exit date', ''],
      ],
    ),
    spacer(),

    heading('3. What the Vendor Holds — Pre-Termination Inventory'),
    simpleTable(
      ['Asset', 'Held by vendor?', 'Export format', 'Owner per contract'],
      [
        ['Our input data / documents', '[Y/N]', '[format]', '[us / vendor]'],
        ['Fine-tuned model weights', '[Y/N]', '[portable? often not]', '[verify contract]'],
        ['Prompts, configurations, guardrail rules', '[Y/N]', '[format]', ''],
        ['Embeddings / vector stores built from our data', '[Y/N]', '[format]', ''],
        ['Usage logs and audit trails', '[Y/N]', '[format]', ''],
        ['Evaluation results and test sets', '[Y/N]', '[format]', ''],
      ],
    ),
    italic('Fine-tuned weights and embeddings are the common traps: contractually ours in spirit, technically non-portable in practice. Establish reality before giving notice.'),
    spacer(),

    heading('4. Data Return and Deletion'),
    bullet('Request export of all assets in §3 in [agreed formats] by [date].'),
    bullet('Verify export completeness against the inventory: [sampling method].'),
    bullet('Obtain certified deletion (including backups and any data retained for "model improvement") with a named officer’s attestation, by [date]. Cite [contract clause / DPA clause].'),
    bullet('Confirm deletion scope covers sub-processors. Request the current sub-processor list and attestations.'),
    spacer(),

    heading('5. Transition'),
    simpleTable(
      ['Option', 'Selected?', 'Notes'],
      [
        ['Replace with vendor [B]', '', '[migration of prompts/configs; re-run evaluation suite on new model]'],
        ['Bring in-house', '', '[infrastructure, skills, license check on any model artifacts]'],
        ['Decommission (process reverts to manual)', '', '[capacity plan for the manual path]'],
      ],
    ),
    bullet('Parallel run: operate old and new for [period]; compare outputs on [sample]; acceptance criteria: [metrics matching the model card thresholds].'),
    bullet('Re-run the AI Impact Assessment if the replacement model materially differs in behavior, data handling, or provider jurisdiction.'),
    spacer(),

    heading('6. Access and Integration Teardown'),
    bullet('Revoke API keys, OAuth grants, SSO entitlements, and network allowlists by [date]; verify with [evidence].'),
    bullet('Remove vendor SDKs/webhooks from codebases; archive integration code.'),
    bullet('Update the AI Inventory (status → Retired) and the risk register (close or re-point third-party risks).'),
    spacer(),

    heading('7. Communications'),
    simpleTable(
      ['Audience', 'Message', 'When', 'Owner'],
      [
        ['Affected staff', '[what changes, fallback process]', '[date]', ''],
        ['Customers (if user-facing)', '[service change notice]', '[date]', ''],
        ['Regulator (if notifiable)', '[per obligations]', '[date]', '[Legal]'],
      ],
    ),
    spacer(),

    heading('8. Closure and Lessons'),
    para('Exit is complete when: data returned and deletion certified; access torn down; transition acceptance criteria met; inventory and register updated. Hold a lessons-learned review and feed contract findings (e.g., portability gaps) back into the vendor assessment questionnaire for future procurements.'),
    italic('Alignment: ISO/IEC 42001 Annex A.10 (third parties); pairs with the Vendor Assessment module on this site.'),
  ]);
  await saveDocx(doc, outDir, 'ai-vendor-termination-plan.docx');
}
