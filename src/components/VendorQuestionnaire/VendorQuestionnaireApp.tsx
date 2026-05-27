import { useEffect, useState, useMemo } from 'react';
import { Download, Save, ChevronLeft, ChevronRight, Shield, Trash2, AlertTriangle, CheckCircle } from 'lucide-react';
import { v4 as uuid } from 'uuid';
import {
  listVendorQuestionnaires,
  saveVendorQuestionnaire,
  deleteVendorQuestionnaire,
  listSystems,
} from '../../lib/storage/localStorage';
import { downloadVendorWord } from '../../lib/exports/vendorWord';
import type { VendorQuestionnaire, AISystem } from '../../lib/storage/schemas';

interface Question {
  id: string;
  text: string;
  weight: number;
  redFlagThreshold: number;
  category: string;
}

interface Category {
  key: string;
  title: string;
  questions: Question[];
}

const CATEGORIES: Category[] = [
  {
    key: 'governance',
    title: '1. AI Governance & Accountability',
    questions: [
      { id: 'g1', text: 'Does the vendor have a documented AI governance policy?', weight: 3, redFlagThreshold: 1, category: 'Governance' },
      { id: 'g2', text: 'Is there a named individual accountable for AI risk management?', weight: 3, redFlagThreshold: 1, category: 'Governance' },
      { id: 'g3', text: 'Does the vendor maintain an inventory of AI models used in the product?', weight: 2, redFlagThreshold: 1, category: 'Governance' },
      { id: 'g4', text: 'Is there a formal AI ethics review process for new models or use cases?', weight: 2, redFlagThreshold: 0, category: 'Governance' },
      { id: 'g5', text: 'Does the vendor provide transparency reports on AI system performance?', weight: 2, redFlagThreshold: 0, category: 'Governance' },
    ],
  },
  {
    key: 'data',
    title: '2. Data Governance & Privacy',
    questions: [
      { id: 'd1', text: 'Is customer data used for model training? If yes, can this be opted out?', weight: 3, redFlagThreshold: 1, category: 'Data' },
      { id: 'd2', text: 'Are data processing agreements (DPAs) in place covering AI-specific processing?', weight: 3, redFlagThreshold: 1, category: 'Data' },
      { id: 'd3', text: 'Does the vendor document data lineage for training datasets?', weight: 2, redFlagThreshold: 0, category: 'Data' },
      { id: 'd4', text: 'Are there controls preventing personal data leakage through model outputs?', weight: 3, redFlagThreshold: 1, category: 'Data' },
      { id: 'd5', text: 'Does the vendor support data residency requirements for AI processing?', weight: 2, redFlagThreshold: 0, category: 'Data' },
    ],
  },
  {
    key: 'security',
    title: '3. AI Security',
    questions: [
      { id: 's1', text: 'Has the vendor conducted adversarial robustness testing on their AI models?', weight: 3, redFlagThreshold: 1, category: 'Security' },
      { id: 's2', text: 'Are there controls against prompt injection and manipulation attacks?', weight: 3, redFlagThreshold: 1, category: 'Security' },
      { id: 's3', text: 'Does the vendor have an AI-specific incident response plan?', weight: 3, redFlagThreshold: 1, category: 'Security' },
      { id: 's4', text: 'Are model access controls enforced (authentication, rate limiting, authorization)?', weight: 2, redFlagThreshold: 1, category: 'Security' },
      { id: 's5', text: 'Does the vendor perform regular penetration testing that includes AI components?', weight: 2, redFlagThreshold: 0, category: 'Security' },
    ],
  },
  {
    key: 'model',
    title: '4. Model Lifecycle & Quality',
    questions: [
      { id: 'm1', text: 'Does the vendor maintain model versioning and change management?', weight: 2, redFlagThreshold: 0, category: 'Model' },
      { id: 'm2', text: 'Are model updates tested before deployment? Is rollback possible?', weight: 3, redFlagThreshold: 1, category: 'Model' },
      { id: 'm3', text: 'Does the vendor monitor for model drift and performance degradation?', weight: 2, redFlagThreshold: 0, category: 'Model' },
      { id: 'm4', text: 'Are model performance metrics (accuracy, latency, error rates) shared with customers?', weight: 2, redFlagThreshold: 0, category: 'Model' },
      { id: 'm5', text: 'Does the vendor provide SLAs covering AI-specific reliability and availability?', weight: 2, redFlagThreshold: 0, category: 'Model' },
    ],
  },
  {
    key: 'fairness',
    title: '5. Fairness & Bias',
    questions: [
      { id: 'f1', text: 'Has the vendor performed bias testing across demographic groups?', weight: 3, redFlagThreshold: 1, category: 'Fairness' },
      { id: 'f2', text: 'Are bias mitigation measures documented and implemented?', weight: 2, redFlagThreshold: 0, category: 'Fairness' },
      { id: 'f3', text: 'Is there a process for external stakeholders to report bias concerns?', weight: 2, redFlagThreshold: 0, category: 'Fairness' },
      { id: 'f4', text: 'Does the vendor publish model cards or datasheets for AI components?', weight: 2, redFlagThreshold: 0, category: 'Fairness' },
      { id: 'f5', text: 'Are fairness metrics monitored in production?', weight: 2, redFlagThreshold: 0, category: 'Fairness' },
    ],
  },
  {
    key: 'transparency',
    title: '6. Transparency & Explainability',
    questions: [
      { id: 't1', text: 'Can the vendor explain how AI decisions or outputs are generated?', weight: 3, redFlagThreshold: 1, category: 'Transparency' },
      { id: 't2', text: 'Are AI-generated outputs clearly disclosed to end users?', weight: 2, redFlagThreshold: 0, category: 'Transparency' },
      { id: 't3', text: 'Does the vendor provide audit logs of AI decision-making?', weight: 3, redFlagThreshold: 1, category: 'Transparency' },
      { id: 't4', text: 'Is there documentation on the limitations of the AI system?', weight: 2, redFlagThreshold: 0, category: 'Transparency' },
      { id: 't5', text: 'Can customers access explanations suitable for regulatory reporting?', weight: 2, redFlagThreshold: 0, category: 'Transparency' },
    ],
  },
  {
    key: 'compliance',
    title: '7. Regulatory Compliance',
    questions: [
      { id: 'c1', text: 'Has the vendor assessed EU AI Act applicability and classification?', weight: 3, redFlagThreshold: 1, category: 'Compliance' },
      { id: 'c2', text: 'Does the vendor maintain ISO 42001 certification or equivalent?', weight: 2, redFlagThreshold: 0, category: 'Compliance' },
      { id: 'c3', text: 'Can the vendor demonstrate compliance with sector-specific AI regulations?', weight: 2, redFlagThreshold: 0, category: 'Compliance' },
      { id: 'c4', text: 'Does the vendor support customer audit rights covering AI components?', weight: 3, redFlagThreshold: 1, category: 'Compliance' },
      { id: 'c5', text: 'Is there a contractual commitment to notify customers of material AI changes?', weight: 3, redFlagThreshold: 1, category: 'Compliance' },
    ],
  },
  {
    key: 'continuity',
    title: '8. Continuity & Exit',
    questions: [
      { id: 'x1', text: 'What happens to customer data if the vendor discontinues the AI product?', weight: 3, redFlagThreshold: 1, category: 'Continuity' },
      { id: 'x2', text: 'Is there an exit plan for migrating away from the AI vendor?', weight: 2, redFlagThreshold: 0, category: 'Continuity' },
      { id: 'x3', text: 'Does the vendor have concentration risk controls (single model provider dependency)?', weight: 2, redFlagThreshold: 0, category: 'Continuity' },
      { id: 'x4', text: 'Are there contractual provisions for data portability and deletion on exit?', weight: 3, redFlagThreshold: 1, category: 'Continuity' },
      { id: 'x5', text: 'Does the vendor maintain business continuity plans covering AI service disruption?', weight: 2, redFlagThreshold: 0, category: 'Continuity' },
    ],
  },
];

const ALL_QUESTIONS = CATEGORIES.flatMap((c) => c.questions);
const MAX_SCORE = ALL_QUESTIONS.reduce((sum, q) => sum + q.weight * 4, 0);
const ANSWER_LABELS = ['Not addressed', 'Ad hoc / informal', 'Partially implemented', 'Substantially implemented', 'Fully implemented'];

function computeScore(answers: Record<string, number>): { score: number; pct: number; level: string; redFlags: string[] } {
  let weighted = 0;
  const redFlags: string[] = [];
  for (const q of ALL_QUESTIONS) {
    const val = answers[q.id] ?? 0;
    weighted += val * q.weight;
    if (val <= q.redFlagThreshold && q.redFlagThreshold > 0) {
      redFlags.push(q.text);
    }
  }
  const pct = Math.round((weighted / MAX_SCORE) * 100);
  let level: string;
  if (pct >= 80) level = 'Low';
  else if (pct >= 60) level = 'Medium';
  else if (pct >= 40) level = 'High';
  else level = 'Critical';
  return { score: weighted, pct, level, redFlags };
}

const blankVQ = (): VendorQuestionnaire => ({
  id: uuid(),
  vendorName: '',
  assessorName: '',
  assessmentDate: new Date().toISOString().split('T')[0],
  linkedSystemId: '',
  answers: {},
  redFlags: [],
  overallScore: 0,
  riskLevel: 'Medium',
  notes: '',
  status: 'Draft',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

export default function VendorQuestionnaireApp() {
  const [vqs, setVqs] = useState<VendorQuestionnaire[]>([]);
  const [systems, setSystems] = useState<AISystem[]>([]);
  const [active, setActive] = useState<VendorQuestionnaire | null>(null);
  const [step, setStep] = useState(0);

  useEffect(() => {
    setVqs(listVendorQuestionnaires());
    setSystems(listSystems());
  }, []);

  const start = () => {
    setActive(blankVQ());
    setStep(0);
  };

  const open = (vq: VendorQuestionnaire) => {
    setActive(vq);
    setStep(0);
  };

  const save = () => {
    if (!active) return;
    const { pct, level, redFlags } = computeScore(active.answers);
    const updated: VendorQuestionnaire = {
      ...active,
      overallScore: pct,
      riskLevel: level as VendorQuestionnaire['riskLevel'],
      redFlags,
      updatedAt: new Date().toISOString(),
    };
    saveVendorQuestionnaire(updated);
    setActive(updated);
    setVqs(listVendorQuestionnaires());
  };

  const complete = async () => {
    if (!active) return;
    const { pct, level, redFlags } = computeScore(active.answers);
    const updated: VendorQuestionnaire = {
      ...active,
      overallScore: pct,
      riskLevel: level as VendorQuestionnaire['riskLevel'],
      redFlags,
      status: 'Complete',
      updatedAt: new Date().toISOString(),
    };
    saveVendorQuestionnaire(updated);
    setActive(updated);
    setVqs(listVendorQuestionnaires());
    await downloadVendorWord(updated, CATEGORIES);
  };

  const remove = (id: string) => {
    if (!confirm('Delete this assessment?')) return;
    deleteVendorQuestionnaire(id);
    setVqs(listVendorQuestionnaires());
  };

  const setAnswer = (qId: string, value: number) => {
    if (!active) return;
    setActive({ ...active, answers: { ...active.answers, [qId]: value } });
  };

  const liveScore = useMemo(() => {
    if (!active) return { pct: 0, level: 'Medium', redFlags: [] as string[] };
    return computeScore(active.answers);
  }, [active?.answers]);

  if (!active) {
    return (
      <div>
        <div className="flex items-center gap-2 text-sm text-ink-500 mb-6">
          <Shield size={14} className="text-ok-600" aria-hidden />
          <span>All vendor assessment data stays in your browser. Nothing is transmitted.</span>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="card">
            <h3 className="text-lg font-semibold text-ink-900">New vendor assessment</h3>
            <p className="text-sm text-ink-600 mt-1">
              40 weighted questions across 8 domains. Red-flag detection highlights critical gaps.
            </p>
            <button onClick={start} className="btn btn-primary btn-md w-full mt-4">
              Start assessment
            </button>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-ink-900">Saved assessments</h3>
            {vqs.length === 0 ? (
              <p className="text-sm text-ink-500 mt-2">No saved assessments yet.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {vqs.map((v) => (
                  <li key={v.id} className="flex items-center justify-between border border-ink-200 rounded-md p-3">
                    <div>
                      <p className="font-medium text-ink-900 text-sm">{v.vendorName || '(unnamed)'}</p>
                      <p className="text-xs text-ink-500">
                        {v.status} · {v.riskLevel} risk · {v.overallScore}% · {v.updatedAt.slice(0, 10)}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => open(v)} className="btn btn-ghost btn-sm">Open</button>
                      <button onClick={() => downloadVendorWord(v, CATEGORIES)} className="btn btn-ghost btn-sm"><Download size={14} /></button>
                      <button onClick={() => remove(v.id)} className="btn btn-ghost btn-sm text-risk-600"><Trash2 size={14} /></button>
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

  const category = CATEGORIES[step]!;
  const progress = ((step + 1) / CATEGORIES.length) * 100;
  const answeredInStep = category.questions.filter((q) => (active.answers[q.id] ?? -1) >= 0).length;

  return (
    <div>
      <div className="flex items-center justify-between text-sm text-ink-500 mb-2">
        <span>Section {step + 1} of {CATEGORIES.length}</span>
        <button onClick={() => { setActive(null); setStep(0); }} className="text-ink-500 hover:text-accent-700">
          ← Back to list
        </button>
      </div>
      <div className="h-1 bg-ink-100 rounded-full overflow-hidden mb-6">
        <div className="h-full bg-accent-700 transition-all" style={{ width: `${progress}%` }} aria-hidden />
      </div>

      <div className="lg:grid lg:grid-cols-[1fr_280px] lg:gap-8">
        <div>
          <div className="card mb-4">
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs uppercase tracking-wide text-ink-500 font-semibold mb-1">Vendor name</label>
                <input
                  type="text"
                  value={active.vendorName}
                  onChange={(e) => setActive({ ...active, vendorName: e.target.value })}
                  placeholder="e.g., OpenAI, Anthropic, Vendor X"
                  className="form-input w-full rounded-md border-ink-300"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wide text-ink-500 font-semibold mb-1">Assessor</label>
                <input
                  type="text"
                  value={active.assessorName}
                  onChange={(e) => setActive({ ...active, assessorName: e.target.value })}
                  placeholder="Your name"
                  className="form-input w-full rounded-md border-ink-300"
                />
              </div>
            </div>
          </div>

          <div className="card space-y-6">
            <h2 className="text-xl font-semibold text-ink-900">{category.title}</h2>
            <p className="text-sm text-ink-500">{answeredInStep} of {category.questions.length} answered</p>

            {category.questions.map((q) => {
              const val = active.answers[q.id] ?? -1;
              const isRedFlag = val >= 0 && val <= q.redFlagThreshold && q.redFlagThreshold > 0;
              return (
                <div key={q.id} className={`p-4 rounded-lg border ${isRedFlag ? 'border-risk-300 bg-risk-50' : 'border-ink-100'}`}>
                  <div className="flex items-start gap-2 mb-3">
                    <p className="text-sm font-medium text-ink-800 flex-1">{q.text}</p>
                    {q.weight >= 3 && (
                      <span className="badge-accent text-xs whitespace-nowrap">High weight</span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {ANSWER_LABELS.map((label, i) => (
                      <button
                        key={i}
                        onClick={() => setAnswer(q.id, i)}
                        className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                          val === i
                            ? 'bg-accent-50 border-accent-300 text-accent-700 font-medium'
                            : 'border-ink-200 text-ink-600 hover:border-accent-300'
                        }`}
                      >
                        {i}: {label}
                      </button>
                    ))}
                  </div>
                  {isRedFlag && (
                    <p className="text-xs text-risk-700 mt-2 flex items-center gap-1">
                      <AlertTriangle size={12} /> Red flag — this is a critical gap
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <aside className="mt-6 lg:mt-0 lg:sticky lg:top-20 lg:self-start space-y-4">
          <div className="card text-center">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-500 mb-2">Vendor Risk</p>
            <p className={`text-3xl font-bold ${
              liveScore.level === 'Low' ? 'text-ok-600' :
              liveScore.level === 'Medium' ? 'text-warn-600' :
              liveScore.level === 'High' ? 'text-risk-600' : 'text-risk-700'
            }`}>
              {liveScore.pct}%
            </p>
            <p className={`text-sm font-medium mt-1 ${
              liveScore.level === 'Low' ? 'text-ok-600' :
              liveScore.level === 'Medium' ? 'text-warn-600' :
              liveScore.level === 'High' ? 'text-risk-600' : 'text-risk-700'
            }`}>
              {liveScore.level} Risk
            </p>
          </div>

          {liveScore.redFlags.length > 0 && (
            <div className="card border-risk-200 bg-risk-50">
              <p className="text-xs font-semibold uppercase tracking-wide text-risk-700 mb-2 flex items-center gap-1">
                <AlertTriangle size={12} /> {liveScore.redFlags.length} Red Flag{liveScore.redFlags.length > 1 ? 's' : ''}
              </p>
              <ul className="space-y-1">
                {liveScore.redFlags.slice(0, 5).map((f, i) => (
                  <li key={i} className="text-xs text-risk-700">• {f.slice(0, 60)}...</li>
                ))}
                {liveScore.redFlags.length > 5 && (
                  <li className="text-xs text-risk-600">+{liveScore.redFlags.length - 5} more</li>
                )}
              </ul>
            </div>
          )}

          <div className="card">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-500 mb-2">Notes</p>
            <textarea
              value={active.notes}
              onChange={(e) => setActive({ ...active, notes: e.target.value })}
              rows={4}
              placeholder="Assessment notes..."
              className="form-textarea w-full rounded-md border-ink-300 text-sm"
            />
          </div>
        </aside>
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
          {step < CATEGORIES.length - 1 ? (
            <button onClick={() => setStep((s) => s + 1)} className="btn btn-primary btn-md">
              Next section <ChevronRight size={16} />
            </button>
          ) : (
            <button onClick={complete} className="btn btn-primary btn-lg">
              <Download size={16} /> Complete &amp; download .docx
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
