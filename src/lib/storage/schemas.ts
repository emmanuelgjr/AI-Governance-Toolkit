import { z } from 'zod';

export const AIType = z.enum([
  'LLM',
  'Agentic AI',
  'Traditional ML',
  'Computer Vision',
  'Generative AI',
  'Multi-modal',
  'Recommender',
  'Speech',
  'Other',
]);

export const LifecycleStage = z.enum([
  'Discovery',
  'Approved',
  'Development',
  'Production',
  'Retired',
]);

export const DeploymentModel = z.enum(['SaaS API', 'Self-hosted', 'Hybrid', 'Edge', 'Embedded']);
export const BuildVsBuy = z.enum(['Internal build', 'Vendor product', 'Open-source', 'Hybrid']);
export const AutonomyLevel = z.enum([
  'Read-only',
  'Suggest',
  'Act with approval',
  'Autonomous',
]);
export const EuAiActTier = z.enum(['Prohibited', 'High-risk', 'Limited', 'Minimal', 'Unassessed']);
export const InternalRiskTier = z.enum(['Low', 'Moderate', 'High', 'Critical']);

export const aiSystemSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2),
  businessOwner: z.string(),
  technicalOwner: z.string(),
  businessUnit: z.string(),
  businessPurpose: z.string(),
  status: LifecycleStage,
  aiType: AIType,
  deploymentModel: DeploymentModel,
  buildVsBuy: BuildVsBuy,
  trainingDataSources: z.string().default(''),
  inferenceInputs: z.string().default(''),
  inferenceOutputs: z.string().default(''),
  personalDataInvolved: z.boolean().default(false),
  personalDataCategories: z.array(z.string()).default([]),
  euAiActTier: EuAiActTier.default('Unassessed'),
  internalRiskTier: InternalRiskTier.default('Moderate'),
  classificationRationale: z.string().default(''),
  autonomyLevel: AutonomyLevel,
  humanOversight: z.string().default(''),
  vendor: z.string().default(''),
  dpaInPlace: z.boolean().default(false),
  modelProvenance: z.string().default(''),
  vendorAssessmentLink: z.string().default(''),
  euAiActApplies: z.boolean().default(false),
  sectoralRegulation: z.array(z.string()).default([]),
  crossBorderDataFlows: z.boolean().default(false),
  productionDate: z.string().default(''),
  lastReviewed: z.string(),
  nextReviewDue: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type AISystem = z.infer<typeof aiSystemSchema>;

export const aiiaSchema = z.object({
  id: z.string().uuid(),
  aiSystemId: z.string().uuid(),
  aiSystemName: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  status: z.enum(['Draft', 'Complete']).default('Draft'),
  sections: z.object({
    purpose: z.record(z.string(), z.string()),
    stakeholders: z.record(z.string(), z.string()),
    data: z.record(z.string(), z.string()),
    misuse: z.record(z.string(), z.string()),
    fairness: z.record(z.string(), z.string()),
    transparency: z.record(z.string(), z.string()),
    oversight: z.record(z.string(), z.string()),
    robustness: z.record(z.string(), z.string()),
    environmental: z.record(z.string(), z.string()),
    lifecycle: z.record(z.string(), z.string()),
  }),
});

export type AIIA = z.infer<typeof aiiaSchema>;

export const RiskCategory = z.enum([
  'Bias',
  'Privacy',
  'Security',
  'Operational',
  'Reputational',
  'Regulatory',
  'Strategic',
  'Third-party',
]);
export const Treatment = z.enum(['Accept', 'Mitigate', 'Transfer', 'Avoid']);
export const RiskStatus = z.enum(['Open', 'In progress', 'Closed', 'Accepted']);

export const riskSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(3),
  description: z.string(),
  linkedSystemIds: z.array(z.string().uuid()).default([]),
  category: RiskCategory,
  inherentLikelihood: z.number().int().min(1).max(5),
  inherentImpact: z.number().int().min(1).max(5),
  existingControls: z.string().default(''),
  controlCatalogRefs: z.array(z.string()).default([]),
  residualLikelihood: z.number().int().min(1).max(5),
  residualImpact: z.number().int().min(1).max(5),
  owner: z.string(),
  treatment: Treatment,
  actionItems: z.string().default(''),
  status: RiskStatus,
  lastReviewed: z.string(),
  nextReview: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Risk = z.infer<typeof riskSchema>;

// Vendor Questionnaire
export const VendorRiskLevel = z.enum(['Low', 'Medium', 'High', 'Critical']);

export const vendorQuestionnaireSchema = z.object({
  id: z.string().uuid(),
  vendorName: z.string().min(1),
  assessorName: z.string().default(''),
  assessmentDate: z.string(),
  linkedSystemId: z.string().default(''),
  answers: z.record(z.string(), z.number().min(0).max(4)),
  redFlags: z.array(z.string()).default([]),
  overallScore: z.number().default(0),
  riskLevel: VendorRiskLevel.default('Medium'),
  notes: z.string().default(''),
  status: z.enum(['Draft', 'Complete']).default('Draft'),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type VendorQuestionnaire = z.infer<typeof vendorQuestionnaireSchema>;

// Maturity Self-Assessment
export const MaturityLevel = z.enum(['1 - Initial', '2 - Developing', '3 - Defined', '4 - Managed', '5 - Optimizing']);

export const maturityAssessmentSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  assessorName: z.string().default(''),
  assessmentDate: z.string(),
  scores: z.record(z.string(), z.number().min(1).max(5)),
  overallMaturity: z.number().default(1),
  actionItems: z.array(z.object({
    domain: z.string(),
    action: z.string(),
    priority: z.enum(['High', 'Medium', 'Low']),
    targetDate: z.string().default(''),
  })).default([]),
  status: z.enum(['Draft', 'Complete']).default('Draft'),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type MaturityAssessment = z.infer<typeof maturityAssessmentSchema>;

export const exportBundleSchema = z.object({
  version: z.literal('1.0'),
  exportedAt: z.string(),
  systems: z.array(aiSystemSchema),
  aiias: z.array(aiiaSchema),
  risks: z.array(riskSchema),
});

export type ExportBundle = z.infer<typeof exportBundleSchema>;
