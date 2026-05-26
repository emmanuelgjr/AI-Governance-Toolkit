import { useEffect, useState } from 'react';
import { Download, Save, ChevronLeft, ChevronRight, Shield } from 'lucide-react';
import { v4 as uuid } from 'uuid';
import {
  listAiias,
  saveAiia,
  listSystems,
} from '../../lib/storage/localStorage';
import { downloadAiiaWord } from '../../lib/exports/aiiaWord';
import type { AIIA, AISystem } from '../../lib/storage/schemas';

interface Section {
  key: keyof AIIA['sections'];
  title: string;
  questions: string[];
}

const SECTIONS: Section[] = [
  {
    key: 'purpose',
    title: '1. Purpose and intended use',
    questions: [
      "In one paragraph, what is this AI system's purpose?",
      'Who are the intended users? (employees / customers / partners / regulators / public)',
      'What decisions does the system make or support?',
      'Does the system make decisions producing legal or similarly significant effects on individuals?',
      'Is the system deployed in a domain triggering sectoral regulation?',
      'EU AI Act classification (and rationale if overriding the auto-suggestion).',
    ],
  },
  {
    key: 'stakeholders',
    title: '2. Stakeholders',
    questions: [
      "Who is affected by the system's decisions or outputs?",
      'Which stakeholder groups have been consulted in the design?',
      'Are any stakeholder groups in a position of dependency or reduced agency?',
      'How is affected-stakeholder feedback collected post-deployment?',
    ],
  },
  {
    key: 'data',
    title: '3. Data',
    questions: [
      'What data is used for training, fine-tuning, or evaluation?',
      'Does the system process personal data? If yes, which categories?',
      'Lawful basis for processing personal data?',
      'Cross-border data flows involved? Explain.',
      'Is there a DPIA on file? Link.',
    ],
  },
  {
    key: 'misuse',
    title: '4. Foreseeable misuse and abuse',
    questions: [
      'How could a malicious user attempt to misuse this system? (≥ 3 scenarios)',
      'How could a well-intentioned but careless user cause harm?',
      'What controls mitigate the misuse scenarios?',
      'Has adversarial testing been performed? Link to test records (AI-CTRL-003).',
    ],
  },
  {
    key: 'fairness',
    title: '5. Fairness and bias',
    questions: [
      'What demographic or protected groups could be impacted by errors?',
      'What testing has been done for performance variance across groups?',
      'What are the known fairness limitations?',
      'How will fairness be monitored post-deployment?',
    ],
  },
  {
    key: 'transparency',
    title: '6. Transparency and explainability',
    questions: [
      'Are users informed they are interacting with an AI system?',
      'Is meaningful information about the logic provided to affected individuals?',
      'Is documentation (model card, datasheet) maintained and accessible?',
      'Are decisions logged in a form suitable for after-the-fact review?',
    ],
  },
  {
    key: 'oversight',
    title: '7. Human oversight',
    questions: [
      'Where in the decision flow is a human in the loop?',
      'Can a human pause, override, or roll back system actions?',
      'How are oversight personnel trained?',
      'What signals trigger human review?',
    ],
  },
  {
    key: 'robustness',
    title: '8. Robustness and security',
    questions: [
      'What testing has been performed for accuracy in production conditions?',
      'Has adversarial robustness testing been performed? Link.',
      'What monitoring is in place for drift, degradation, anomalous behavior?',
      'What is the incident response plan?',
    ],
  },
  {
    key: 'environmental',
    title: '9. Environmental and social impact',
    questions: [
      'Estimated energy footprint of training and inference (kWh / tCO2e if known)?',
      'Social impacts beyond direct stakeholders (e.g., labor market)?',
    ],
  },
  {
    key: 'lifecycle',
    title: '10. Lifecycle considerations',
    questions: [
      'Trigger criteria for re-assessment (material change / time-based / incident-triggered)?',
      'Decommissioning plan?',
      'Data retention and deletion at decommissioning?',
      'Successor system handoff?',
    ],
  },
];

const blank = (system: AISystem | null): AIIA => ({
  id: uuid(),
  aiSystemId: system?.id ?? '',
  aiSystemName: system?.name ?? '',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  status: 'Draft',
  sections: SECTIONS.reduce(
    (acc, s) => ({
      ...acc,
      [s.key]: Object.fromEntries(s.questions.map((q) => [q, ''])),
    }),
    {} as AIIA['sections'],
  ),
});

export default function AIIAWizard() {
  const [systems, setSystems] = useState<AISystem[]>([]);
  const [aiias, setAiias] = useState<AIIA[]>([]);
  const [active, setActive] = useState<AIIA | null>(null);
  const [step, setStep] = useState(0);

  useEffect(() => {
    setSystems(listSystems());
    setAiias(listAiias());
  }, []);

  const start = (system: AISystem | null) => {
    const a = blank(system);
    setActive(a);
    setStep(0);
  };

  const save = () => {
    if (!active) return;
    const updated = { ...active, updatedAt: new Date().toISOString() };
    saveAiia(updated);
    setActive(updated);
    setAiias(listAiias());
  };

  const complete = async () => {
    if (!active) return;
    const updated: AIIA = { ...active, status: 'Complete', updatedAt: new Date().toISOString() };
    saveAiia(updated);
    setActive(updated);
    setAiias(listAiias());
    await downloadAiiaWord(updated);
  };

  if (!active) {
    return (
      <div>
        <div className="flex items-center gap-2 text-sm text-ink-500 mb-6">
          <Shield size={14} className="text-ok-600" aria-hidden />
          <span>Your AIIA responses stay in your browser.</span>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="card">
            <h3 className="text-lg font-semibold text-ink-900">Start a new AIIA</h3>
            <p className="text-sm text-ink-600 mt-1">
              Pick an AI system from your inventory, or run a standalone AIIA.
            </p>
            <div className="mt-4 space-y-2">
              <button onClick={() => start(null)} className="btn btn-secondary btn-md w-full">
                Standalone AIIA (no inventory link)
              </button>
              {systems.length === 0 ? (
                <p className="text-xs text-ink-500 mt-2">
                  Add systems in the <a href={`${import.meta.env.BASE_URL}inventory`} className="text-accent-700 hover:underline">Inventory</a> first to link them here.
                </p>
              ) : (
                <select
                  onChange={(e) => {
                    const sys = systems.find((s) => s.id === e.target.value);
                    if (sys) start(sys);
                  }}
                  defaultValue=""
                  className="form-select w-full rounded-md border-ink-300 mt-2"
                >
                  <option value="" disabled>
                    Or pick an AI system from inventory...
                  </option>
                  {systems.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-ink-900">Saved AIIAs</h3>
            {aiias.length === 0 ? (
              <p className="text-sm text-ink-500 mt-2">No saved AIIAs yet.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {aiias.map((a) => (
                  <li key={a.id} className="flex items-center justify-between border border-ink-200 rounded-md p-3">
                    <div>
                      <p className="font-medium text-ink-900 text-sm">{a.aiSystemName || '(unnamed)'}</p>
                      <p className="text-xs text-ink-500">{a.status} · updated {a.updatedAt.slice(0, 10)}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setActive(a);
                          setStep(0);
                        }}
                        className="btn btn-ghost btn-sm"
                      >
                        Open
                      </button>
                      <button
                        onClick={() => downloadAiiaWord(a)}
                        className="btn btn-secondary btn-sm"
                      >
                        <Download size={14} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    );
  }

  const section = SECTIONS[step]!;
  const answers = active.sections[section.key];

  const setAnswer = (q: string, value: string) => {
    setActive({
      ...active,
      sections: {
        ...active.sections,
        [section.key]: { ...answers, [q]: value },
      },
    });
  };

  const progress = ((step + 1) / SECTIONS.length) * 100;

  return (
    <div>
      <div className="flex items-center justify-between text-sm text-ink-500 mb-2">
        <span>Section {step + 1} of {SECTIONS.length}</span>
        <button
          onClick={() => {
            setActive(null);
            setStep(0);
          }}
          className="text-ink-500 hover:text-accent-700"
        >
          ← Back to AIIA list
        </button>
      </div>
      <div className="h-1 bg-ink-100 rounded-full overflow-hidden mb-6">
        <div className="h-full bg-accent-700 transition-all" style={{ width: `${progress}%` }} aria-hidden />
      </div>

      <div className="card space-y-5">
        <div>
          <label className="block text-xs uppercase tracking-wide text-ink-500 font-semibold mb-1">
            AI system
          </label>
          <input
            type="text"
            value={active.aiSystemName}
            onChange={(e) => setActive({ ...active, aiSystemName: e.target.value })}
            placeholder="AI system this assessment covers"
            className="form-input w-full rounded-md border-ink-300"
          />
        </div>

        <h2 className="text-xl font-semibold text-ink-900">{section.title}</h2>

        <div className="space-y-5">
          {section.questions.map((q) => (
            <div key={q}>
              <label className="block text-sm font-medium text-ink-800 mb-1">{q}</label>
              <textarea
                value={answers[q] ?? ''}
                onChange={(e) => setAnswer(q, e.target.value)}
                rows={3}
                className="form-textarea w-full rounded-md border-ink-300 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/30"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-2">
          <button
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="btn btn-ghost btn-md disabled:opacity-30"
          >
            <ChevronLeft size={16} /> Back
          </button>
          <button onClick={save} className="btn btn-secondary btn-md">
            <Save size={16} /> Save
          </button>
        </div>
        <div className="flex gap-2">
          {step < SECTIONS.length - 1 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              className="btn btn-primary btn-md"
            >
              Next section <ChevronRight size={16} />
            </button>
          ) : (
            <button onClick={complete} className="btn btn-primary btn-lg">
              <Download size={16} /> Mark complete &amp; download .docx
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
