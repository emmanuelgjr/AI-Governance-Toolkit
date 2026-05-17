import type { AISystem } from '../storage/schemas';

interface Suggestion {
  tier: 'Prohibited' | 'High-risk' | 'Limited' | 'Minimal' | 'Unassessed';
  rationale: string;
}

const PROHIBITED_KEYWORDS = ['social score', 'subliminal', 'biometric categorisation of natural persons by sensitive characteristics'];
const HIGH_RISK_SECTORS = [
  'banking', 'credit', 'insurance', 'healthcare', 'employment', 'hiring', 'education',
  'critical infrastructure', 'law enforcement', 'migration', 'judicial',
];

export function suggestEuAiActTier(system: Pick<AISystem, 'businessPurpose' | 'sectoralRegulation' | 'autonomyLevel' | 'personalDataInvolved'>): Suggestion {
  const purpose = system.businessPurpose.toLowerCase();
  for (const k of PROHIBITED_KEYWORDS) {
    if (purpose.includes(k)) {
      return { tier: 'Prohibited', rationale: `Purpose contains "${k}" which is prohibited under EU AI Act Article 5.` };
    }
  }

  const sectoralStr = system.sectoralRegulation.join(' ').toLowerCase();
  const highRiskHit = HIGH_RISK_SECTORS.find((h) => purpose.includes(h) || sectoralStr.includes(h));
  if (highRiskHit) {
    return {
      tier: 'High-risk',
      rationale: `System operates in "${highRiskHit}" which is enumerated as high-risk in EU AI Act Annex III.`,
    };
  }

  if (system.autonomyLevel === 'Autonomous' && system.personalDataInvolved) {
    return {
      tier: 'High-risk',
      rationale: 'Autonomous operation involving personal data carries elevated risk; high-risk classification suggested pending review.',
    };
  }

  if (purpose.includes('chatbot') || purpose.includes('assistant') || purpose.includes('summarize')) {
    return {
      tier: 'Limited',
      rationale: 'Likely subject to Article 50 transparency obligations (interacting with AI must be disclosed to users).',
    };
  }

  return {
    tier: 'Minimal',
    rationale: 'No high-risk Annex III use case or prohibited practice detected. Confirm during AIIA.',
  };
}

export function suggestInternalRisk(system: Pick<AISystem, 'autonomyLevel' | 'personalDataInvolved' | 'deploymentModel'>): 'Low' | 'Moderate' | 'High' | 'Critical' {
  let score = 0;
  if (system.autonomyLevel === 'Autonomous') score += 3;
  else if (system.autonomyLevel === 'Act with approval') score += 2;
  else if (system.autonomyLevel === 'Suggest') score += 1;
  if (system.personalDataInvolved) score += 2;
  if (system.deploymentModel === 'SaaS API') score += 1;
  if (score >= 6) return 'Critical';
  if (score >= 4) return 'High';
  if (score >= 2) return 'Moderate';
  return 'Low';
}
