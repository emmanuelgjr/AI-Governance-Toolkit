import { useEffect, useMemo, useState } from 'react';
import {
  Download,
  Save,
  Plus,
  Trash2,
  Shield,
  ChevronRight,
  ArrowLeft,
  CheckCircle,
} from 'lucide-react';
import { v4 as uuid } from 'uuid';
import {
  listMaturityAssessments,
  saveMaturityAssessment,
  deleteMaturityAssessment,
} from '../../lib/storage/localStorage';
import { downloadMaturityWord } from '../../lib/exports/maturityWord';
import type { MaturityAssessment } from '../../lib/storage/schemas';

/* ------------------------------------------------------------------ */
/*  Domain & question definitions                                      */
/* ------------------------------------------------------------------ */

interface Domain {
  key: string;
  title: string;
  questions: string[];
}

const DOMAINS: Domain[] = [
  {
    key: 'governance_strategy',
    title: 'Governance & Strategy',
    questions: [
      'AI policy: Has the organization established a formal AI governance policy approved by senior leadership?',
      'Board oversight: Does the board or governing body receive regular reports on AI risks and opportunities?',
      'AI committee: Is there a dedicated AI governance committee or equivalent cross-functional body?',
      'Strategic alignment: Are AI initiatives explicitly aligned with organizational strategy and risk appetite?',
      'Budget allocation: Are adequate resources (budget, headcount, tooling) allocated to AI governance activities?',
    ],
  },
  {
    key: 'risk_management',
    title: 'Risk Management',
    questions: [
      'AI risk framework: Does the organization maintain an AI-specific risk framework integrated with enterprise risk management?',
      'Risk assessment process: Are AI systems subject to structured risk assessments before deployment and periodically thereafter?',
      'Risk appetite: Has the organization defined and documented its risk appetite for AI-related risks?',
      'Risk monitoring: Are AI risks continuously monitored with defined key risk indicators and escalation triggers?',
      'Risk reporting: Is there a defined cadence for AI risk reporting to senior management and the board?',
    ],
  },
  {
    key: 'data_management',
    title: 'Data Management',
    questions: [
      'Data governance: Is there a data governance framework that addresses AI training data, inference inputs, and outputs?',
      'Data quality: Are data quality standards defined and enforced for data used in AI systems?',
      'Data lineage: Can the organization trace data lineage from source to AI model input and output?',
      'Privacy compliance: Are privacy impact assessments performed for AI systems processing personal data?',
      'Data retention: Are data retention and deletion policies defined and enforced for AI-related data assets?',
    ],
  },
  {
    key: 'model_lifecycle',
    title: 'Model Lifecycle',
    questions: [
      'Development standards: Are there documented standards for AI model development, including coding practices and peer review?',
      'Testing and validation: Are AI models subjected to rigorous testing and validation before deployment?',
      'Deployment controls: Are there formal approval gates and change management controls for deploying AI models to production?',
      'Monitoring: Are deployed AI models continuously monitored for drift, degradation, and anomalous behavior?',
      'Versioning: Is there a model versioning and registry system enabling rollback and audit trail?',
    ],
  },
  {
    key: 'ethics_fairness',
    title: 'Ethics & Fairness',
    questions: [
      'Ethics framework: Has the organization adopted an AI ethics framework or set of principles?',
      'Bias assessment: Are AI systems tested for bias across demographic and protected groups before deployment?',
      'Impact assessment: Are impact assessments (social, environmental, human rights) performed for high-risk AI systems?',
      'Stakeholder engagement: Are affected stakeholders consulted during AI system design and deployment?',
      'Appeal mechanisms: Are there mechanisms for individuals to challenge or appeal AI-driven decisions?',
    ],
  },
  {
    key: 'security',
    title: 'Security',
    questions: [
      'Threat modeling: Are AI-specific threat models developed covering adversarial attacks, data poisoning, and model theft?',
      'Adversarial testing: Is adversarial testing (red-teaming) performed on AI systems before deployment?',
      'Access controls: Are role-based access controls enforced for AI model artifacts, training data, and inference endpoints?',
      'Incident response: Is there an AI-specific incident response plan covering model failures and adversarial compromise?',
      'Supply chain security: Is the AI supply chain (frameworks, pre-trained models, data sources) assessed for security risks?',
    ],
  },
  {
    key: 'transparency_explainability',
    title: 'Transparency & Explainability',
    questions: [
      'Disclosure practices: Are users and affected individuals informed when they interact with or are subject to AI systems?',
      'Explainability methods: Are appropriate explainability techniques applied based on use-case risk level?',
      'Documentation: Are model cards, datasheets, or equivalent documentation maintained for AI systems?',
      'Stakeholder communication: Are AI governance practices and outcomes communicated to relevant stakeholders?',
      'Regulatory reporting: Is the organization prepared to meet regulatory reporting requirements for AI systems?',
    ],
  },
  {
    key: 'third_party_management',
    title: 'Third-Party Management',
    questions: [
      'Vendor assessment: Are AI vendors and third-party model providers subject to due diligence and risk assessment?',
      'Contractual controls: Do contracts with AI vendors include provisions for audit, data handling, and liability?',
      'Ongoing monitoring: Are third-party AI services monitored for performance, compliance, and risk on an ongoing basis?',
      'Exit planning: Are exit strategies and data portability plans in place for critical third-party AI dependencies?',
      'Concentration risk: Is concentration risk assessed for reliance on single AI vendors or model providers?',
    ],
  },
];

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

const today = () => new Date().toISOString().slice(0, 10);

function blankAssessment(): MaturityAssessment {
  const scores: Record<string, number> = {};
  DOMAINS.forEach((d) =>
    d.questions.forEach((_, qi) => {
      scores[`${d.key}.q${qi}`] = 1;
    }),
  );
  return {
    id: uuid(),
    name: '',
    assessorName: '',
    assessmentDate: today(),
    scores,
    overallMaturity: 1,
    actionItems: [],
    status: 'Draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/* ------------------------------------------------------------------ */
/*  Scoring helpers                                                    */
/* ------------------------------------------------------------------ */

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

function overallScore(scores: Record<string, number>): number {
  const domainScores = DOMAINS.map((d) => domainAverage(scores, d.key));
  return domainScores.reduce((a, b) => a + b, 0) / domainScores.length;
}

/* ------------------------------------------------------------------ */
/*  SVG radar chart                                                    */
/* ------------------------------------------------------------------ */

function RadarChart({
  scores,
  size = 320,
}: {
  scores: Record<string, number>;
  size?: number;
}) {
  const cx = size / 2;
  const cy = size / 2;
  const maxR = size / 2 - 48;
  const domainCount = DOMAINS.length;
  const angleStep = (2 * Math.PI) / domainCount;
  // Start from top (-PI/2)
  const startAngle = -Math.PI / 2;

  const polarToXY = (angle: number, r: number) => ({
    x: cx + r * Math.cos(angle),
    y: cy + r * Math.sin(angle),
  });

  // Grid lines (levels 1-5)
  const gridLines = [1, 2, 3, 4, 5].map((level) => {
    const r = (level / 5) * maxR;
    const points = Array.from({ length: domainCount }, (_, i) => {
      const angle = startAngle + i * angleStep;
      const { x, y } = polarToXY(angle, r);
      return `${x},${y}`;
    }).join(' ');
    return (
      <polygon
        key={level}
        points={points}
        fill="none"
        stroke="#e2e8f0"
        strokeWidth={level === 5 ? 1.5 : 0.75}
      />
    );
  });

  // Axis lines
  const axisLines = DOMAINS.map((_, i) => {
    const angle = startAngle + i * angleStep;
    const { x, y } = polarToXY(angle, maxR);
    return (
      <line
        key={i}
        x1={cx}
        y1={cy}
        x2={x}
        y2={y}
        stroke="#cbd5e1"
        strokeWidth={0.75}
      />
    );
  });

  // Data polygon
  const domainScores = DOMAINS.map((d) => domainAverage(scores, d.key));
  const dataPoints = domainScores
    .map((score, i) => {
      const angle = startAngle + i * angleStep;
      const r = (score / 5) * maxR;
      const { x, y } = polarToXY(angle, r);
      return `${x},${y}`;
    })
    .join(' ');

  // Domain labels
  const labels = DOMAINS.map((d, i) => {
    const angle = startAngle + i * angleStep;
    const labelR = maxR + 28;
    const { x, y } = polarToXY(angle, labelR);
    const score = domainAverage(scores, d.key);

    let textAnchor: 'start' | 'middle' | 'end' = 'middle';
    if (Math.cos(angle) > 0.1) textAnchor = 'start';
    else if (Math.cos(angle) < -0.1) textAnchor = 'end';

    return (
      <text
        key={d.key}
        x={x}
        y={y}
        textAnchor={textAnchor}
        dominantBaseline="central"
        className="fill-ink-700"
        fontSize={10}
        fontWeight={500}
      >
        {d.title.split(' & ')[0]!.split(' ')[0]} {score.toFixed(1)}
      </text>
    );
  });

  // Score dots
  const dots = domainScores.map((score, i) => {
    const angle = startAngle + i * angleStep;
    const r = (score / 5) * maxR;
    const { x, y } = polarToXY(angle, r);
    return <circle key={i} cx={x} cy={y} r={3.5} fill="#5B21B6" />;
  });

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className="w-full max-w-xs mx-auto"
      role="img"
      aria-label="Radar chart showing maturity scores across domains"
    >
      {gridLines}
      {axisLines}
      <polygon
        points={dataPoints}
        fill="#5B21B6"
        fillOpacity={0.18}
        stroke="#5B21B6"
        strokeWidth={2}
      />
      {dots}
      {labels}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Shared tiny components                                             */
/* ------------------------------------------------------------------ */

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-ink-700 mb-1">
        {label}
      </span>
      {children}
    </label>
  );
}

/* ------------------------------------------------------------------ */
/*  Main app                                                           */
/* ------------------------------------------------------------------ */

type View = 'list' | 'setup' | 'assess';

export default function MaturityAssessmentApp() {
  const [assessments, setAssessments] = useState<MaturityAssessment[]>([]);
  const [view, setView] = useState<View>('list');
  const [active, setActive] = useState<MaturityAssessment | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    setAssessments(listMaturityAssessments());
  }, []);

  /* -- List helpers ------------------------------------------------ */
  const onDelete = (id: string) => {
    if (!confirm('Delete this maturity assessment?')) return;
    deleteMaturityAssessment(id);
    setAssessments(listMaturityAssessments());
  };

  const openExisting = (ma: MaturityAssessment) => {
    setActive(ma);
    setActiveTab(0);
    setView('assess');
  };

  /* -- Setup handlers --------------------------------------------- */
  const [setupName, setSetupName] = useState('');
  const [setupAssessor, setSetupAssessor] = useState('');

  const startNew = () => {
    setSetupName('');
    setSetupAssessor('');
    setView('setup');
  };

  const beginAssessment = () => {
    if (!setupName.trim()) return;
    const ma = blankAssessment();
    ma.name = setupName.trim();
    ma.assessorName = setupAssessor.trim();
    setActive(ma);
    setActiveTab(0);
    setView('assess');
  };

  /* -- Assessment handlers ---------------------------------------- */
  const setScore = (scoreKey: string, value: number) => {
    if (!active) return;
    const updated = {
      ...active,
      scores: { ...active.scores, [scoreKey]: value },
    };
    updated.overallMaturity = overallScore(updated.scores);
    setActive(updated);
  };

  const saveDraft = () => {
    if (!active) return;
    const updated = {
      ...active,
      overallMaturity: overallScore(active.scores),
      updatedAt: new Date().toISOString(),
    };
    saveMaturityAssessment(updated);
    setActive(updated);
    setAssessments(listMaturityAssessments());
  };

  const completeAndExport = async () => {
    if (!active) return;
    const updated: MaturityAssessment = {
      ...active,
      status: 'Complete',
      overallMaturity: overallScore(active.scores),
      updatedAt: new Date().toISOString(),
    };
    saveMaturityAssessment(updated);
    setActive(updated);
    setAssessments(listMaturityAssessments());
    await downloadMaturityWord(updated, DOMAINS);
  };

  const backToList = () => {
    setActive(null);
    setView('list');
  };

  /* -- Action items ----------------------------------------------- */
  const addActionItem = () => {
    if (!active) return;
    setActive({
      ...active,
      actionItems: [
        ...active.actionItems,
        { domain: DOMAINS[0]!.title, action: '', priority: 'Medium' as const, targetDate: '' },
      ],
    });
  };

  const updateActionItem = (
    idx: number,
    field: string,
    value: string,
  ) => {
    if (!active) return;
    const items = [...active.actionItems];
    items[idx] = { ...items[idx]!, [field]: value };
    setActive({ ...active, actionItems: items });
  };

  const removeActionItem = (idx: number) => {
    if (!active) return;
    const items = active.actionItems.filter((_, i) => i !== idx);
    setActive({ ...active, actionItems: items });
  };

  /* ================================================================ */
  /*  LIST VIEW                                                       */
  /* ================================================================ */
  if (view === 'list') {
    return (
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2 text-sm text-ink-500">
            <Shield size={14} className="text-ok-600" aria-hidden />
            <span>Your maturity assessment stays in your browser.</span>
          </div>
          <button onClick={startNew} className="btn btn-primary btn-sm">
            <Plus size={14} /> New Assessment
          </button>
        </div>

        {assessments.length === 0 ? (
          <div className="card text-center py-16">
            <p className="text-ink-700 font-medium">
              No maturity assessments yet.
            </p>
            <p className="text-sm text-ink-500 mt-1">
              Start an assessment to gauge your AI governance maturity across
              eight domains.
            </p>
            <button
              onClick={startNew}
              className="btn btn-primary btn-md mt-4"
            >
              <Plus size={14} /> New Assessment
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {assessments.map((ma) => (
              <div
                key={ma.id}
                className="card flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <p className="font-medium text-ink-900">
                    {ma.name || '(untitled)'}
                  </p>
                  <p className="text-xs text-ink-500 mt-0.5">
                    {ma.status} · {ma.assessorName || 'No assessor'} ·{' '}
                    {ma.assessmentDate} · Overall:{' '}
                    {ma.overallMaturity.toFixed(1)} (
                    {maturityLabel(ma.overallMaturity)})
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openExisting(ma)}
                    className="btn btn-ghost btn-sm"
                  >
                    Open
                  </button>
                  <button
                    onClick={() => downloadMaturityWord(ma, DOMAINS)}
                    className="btn btn-secondary btn-sm"
                  >
                    <Download size={14} />
                  </button>
                  <button
                    onClick={() => onDelete(ma.id)}
                    className="text-ink-400 hover:text-risk-600 p-1"
                    aria-label="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  /* ================================================================ */
  /*  SETUP VIEW                                                      */
  /* ================================================================ */
  if (view === 'setup') {
    return (
      <div className="max-w-md mx-auto">
        <button
          onClick={backToList}
          className="text-sm text-ink-500 hover:text-accent-700 mb-6 inline-flex items-center gap-1"
        >
          <ArrowLeft size={14} /> Back to assessments
        </button>
        <div className="card space-y-5">
          <h2 className="text-xl font-semibold text-ink-900">
            New Maturity Assessment
          </h2>
          <Field label="Assessment name *">
            <input
              value={setupName}
              onChange={(e) => setSetupName(e.target.value)}
              placeholder="e.g. Q2 2026 AI Governance Maturity"
              className="form-input w-full rounded-md border-ink-300"
            />
          </Field>
          <Field label="Assessor name">
            <input
              value={setupAssessor}
              onChange={(e) => setSetupAssessor(e.target.value)}
              placeholder="Your name"
              className="form-input w-full rounded-md border-ink-300"
            />
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={backToList} className="btn btn-ghost btn-md">
              Cancel
            </button>
            <button
              onClick={beginAssessment}
              disabled={!setupName.trim()}
              className="btn btn-primary btn-md disabled:opacity-50"
            >
              Begin Assessment <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ================================================================ */
  /*  ASSESS VIEW                                                     */
  /* ================================================================ */
  if (!active) return null;

  // Tabs: 8 domains + 1 action plan
  const tabs = [...DOMAINS.map((d) => d.title), 'Action Plan'];
  const isActionPlan = activeTab === DOMAINS.length;
  const currentDomain = isActionPlan ? null : DOMAINS[activeTab]!;

  const overall = overallScore(active.scores);

  return (
    <div>
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <button
          onClick={backToList}
          className="text-sm text-ink-500 hover:text-accent-700 inline-flex items-center gap-1"
        >
          <ArrowLeft size={14} /> Back to assessments
        </button>
        <div className="flex items-center gap-2">
          <button onClick={saveDraft} className="btn btn-secondary btn-sm">
            <Save size={16} /> Save draft
          </button>
          <button
            onClick={completeAndExport}
            className="btn btn-primary btn-sm"
          >
            <CheckCircle size={14} /> Complete &amp; export .docx
          </button>
        </div>
      </div>

      {/* Assessment title */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-ink-900">{active.name}</h2>
        <p className="text-sm text-ink-500 mt-0.5">
          {active.assessorName && `Assessor: ${active.assessorName} · `}
          {active.assessmentDate} · Overall: {overall.toFixed(1)} (
          {maturityLabel(overall)})
        </p>
      </div>

      {/* Main layout: left content + right sidebar */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left: tabs + content */}
        <div className="flex-1 min-w-0">
          {/* Tab bar */}
          <div className="flex flex-wrap gap-1 mb-6 border-b border-ink-200 pb-px">
            {tabs.map((t, i) => {
              const isActive = activeTab === i;
              const domainScore =
                i < DOMAINS.length
                  ? domainAverage(active.scores, DOMAINS[i]!.key)
                  : null;
              return (
                <button
                  key={t}
                  onClick={() => setActiveTab(i)}
                  className={`px-3 py-2 text-xs font-medium rounded-t-md transition-colors ${
                    isActive
                      ? 'bg-white border border-b-white border-ink-200 -mb-px text-accent-700'
                      : 'text-ink-500 hover:text-ink-700 hover:bg-ink-50'
                  }`}
                >
                  {i < DOMAINS.length
                    ? `${t.split(' ')[0]} ${domainScore != null ? domainScore.toFixed(1) : ''}`
                    : t}
                </button>
              );
            })}
          </div>

          {/* Domain questions */}
          {!isActionPlan && currentDomain && (
            <div className="card space-y-6">
              <h3 className="text-lg font-semibold text-ink-900">
                {currentDomain.title}
              </h3>
              <p className="text-sm text-ink-500">
                Rate each question from 1 (Initial) to 5 (Optimizing).
              </p>
              {currentDomain.questions.map((q, qi) => {
                const scoreKey = `${currentDomain.key}.q${qi}`;
                const currentVal = active.scores[scoreKey] ?? 1;
                return (
                  <div key={scoreKey}>
                    <p className="text-sm font-medium text-ink-800 mb-2">
                      {qi + 1}. {q}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {[1, 2, 3, 4, 5].map((v) => (
                        <button
                          key={v}
                          onClick={() => setScore(scoreKey, v)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                            currentVal === v
                              ? 'bg-[#5B21B6] text-white shadow-sm'
                              : 'bg-ink-100 text-ink-700 hover:bg-ink-200'
                          }`}
                          aria-pressed={currentVal === v}
                        >
                          {v} - {MATURITY_LABELS[v]}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
              <div className="pt-2 border-t border-ink-100">
                <p className="text-sm font-medium text-ink-700">
                  Domain average:{' '}
                  <span className="text-[#5B21B6] font-semibold">
                    {domainAverage(active.scores, currentDomain.key).toFixed(1)}{' '}
                    ({maturityLabel(domainAverage(active.scores, currentDomain.key))})
                  </span>
                </p>
              </div>
            </div>
          )}

          {/* Action plan tab */}
          {isActionPlan && (
            <div className="card space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-ink-900">
                  Action Plan
                </h3>
                <button
                  onClick={addActionItem}
                  className="btn btn-secondary btn-sm"
                >
                  <Plus size={14} /> Add action
                </button>
              </div>
              <p className="text-sm text-ink-500">
                Capture improvement actions linked to domains scoring below your
                target maturity level.
              </p>

              {active.actionItems.length === 0 ? (
                <p className="text-sm text-ink-500 py-8 text-center">
                  No action items yet. Add one to start building your
                  improvement roadmap.
                </p>
              ) : (
                <div className="space-y-4">
                  {active.actionItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="border border-ink-200 rounded-lg p-4 space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wide text-ink-500">
                          Action {idx + 1}
                        </span>
                        <button
                          onClick={() => removeActionItem(idx)}
                          className="text-ink-400 hover:text-risk-600"
                          aria-label="Remove action item"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-3">
                        <Field label="Domain">
                          <select
                            value={item.domain}
                            onChange={(e) =>
                              updateActionItem(idx, 'domain', e.target.value)
                            }
                            className="form-select w-full rounded-md border-ink-300"
                          >
                            {DOMAINS.map((d) => (
                              <option key={d.key} value={d.title}>
                                {d.title}
                              </option>
                            ))}
                          </select>
                        </Field>
                        <Field label="Priority">
                          <select
                            value={item.priority}
                            onChange={(e) =>
                              updateActionItem(idx, 'priority', e.target.value)
                            }
                            className="form-select w-full rounded-md border-ink-300"
                          >
                            {['High', 'Medium', 'Low'].map((p) => (
                              <option key={p}>{p}</option>
                            ))}
                          </select>
                        </Field>
                      </div>
                      <Field label="Action">
                        <textarea
                          value={item.action}
                          onChange={(e) =>
                            updateActionItem(idx, 'action', e.target.value)
                          }
                          rows={2}
                          className="form-textarea w-full rounded-md border-ink-300"
                          placeholder="Describe the improvement action..."
                        />
                      </Field>
                      <Field label="Target date">
                        <input
                          type="date"
                          value={item.targetDate}
                          onChange={(e) =>
                            updateActionItem(idx, 'targetDate', e.target.value)
                          }
                          className="form-input w-full rounded-md border-ink-300"
                        />
                      </Field>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="mt-6 flex items-center justify-between">
            <button
              onClick={() => setActiveTab((t) => Math.max(0, t - 1))}
              disabled={activeTab === 0}
              className="btn btn-ghost btn-md disabled:opacity-30"
            >
              <ArrowLeft size={16} /> Previous
            </button>
            {activeTab < tabs.length - 1 && (
              <button
                onClick={() => setActiveTab((t) => t + 1)}
                className="btn btn-primary btn-md"
              >
                Next <ChevronRight size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Right sidebar: radar chart + score summary */}
        <div className="lg:w-80 shrink-0 space-y-4">
          <div className="card">
            <h3 className="text-sm font-semibold text-ink-700 mb-3">
              Maturity Radar
            </h3>
            <RadarChart scores={active.scores} />
          </div>
          <div className="card">
            <h3 className="text-sm font-semibold text-ink-700 mb-3">
              Domain Scores
            </h3>
            <div className="space-y-2">
              {DOMAINS.map((d) => {
                const avg = domainAverage(active.scores, d.key);
                const pct = (avg / 5) * 100;
                return (
                  <div key={d.key}>
                    <div className="flex items-center justify-between text-xs text-ink-600 mb-0.5">
                      <span>{d.title}</span>
                      <span className="font-mono font-medium">
                        {avg.toFixed(1)}
                      </span>
                    </div>
                    <div className="h-1.5 bg-ink-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: '#5B21B6',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 pt-3 border-t border-ink-100">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-ink-900">
                  Overall
                </span>
                <span className="text-sm font-semibold text-[#5B21B6]">
                  {overall.toFixed(1)} ({maturityLabel(overall)})
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
