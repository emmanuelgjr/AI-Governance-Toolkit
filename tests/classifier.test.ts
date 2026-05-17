import { describe, it, expect } from 'vitest';
import { suggestEuAiActTier, suggestInternalRisk } from '../src/lib/classifiers/eu-ai-act-classifier';

describe('suggestEuAiActTier', () => {
  it('flags prohibited social-score systems', () => {
    const out = suggestEuAiActTier({
      businessPurpose: 'general social score for citizens',
      sectoralRegulation: [],
      autonomyLevel: 'Autonomous',
      personalDataInvolved: true,
    });
    expect(out.tier).toBe('Prohibited');
  });
  it('flags banking decisioning as high-risk', () => {
    const out = suggestEuAiActTier({
      businessPurpose: 'credit decisioning for retail banking customers',
      sectoralRegulation: [],
      autonomyLevel: 'Suggest',
      personalDataInvolved: true,
    });
    expect(out.tier).toBe('High-risk');
  });
  it('flags healthcare as high-risk', () => {
    const out = suggestEuAiActTier({
      businessPurpose: 'clinical decision support in healthcare',
      sectoralRegulation: [],
      autonomyLevel: 'Suggest',
      personalDataInvolved: true,
    });
    expect(out.tier).toBe('High-risk');
  });
  it('flags chatbots as limited (Article 50)', () => {
    const out = suggestEuAiActTier({
      businessPurpose: 'customer service chatbot for general inquiries',
      sectoralRegulation: [],
      autonomyLevel: 'Suggest',
      personalDataInvolved: false,
    });
    expect(out.tier).toBe('Limited');
  });
  it('defaults benign systems to Minimal', () => {
    const out = suggestEuAiActTier({
      businessPurpose: 'internal log clustering for engineers',
      sectoralRegulation: [],
      autonomyLevel: 'Read-only',
      personalDataInvolved: false,
    });
    expect(out.tier).toBe('Minimal');
  });
});

describe('suggestInternalRisk', () => {
  it('returns Critical for autonomous personal-data SaaS', () => {
    expect(
      suggestInternalRisk({
        autonomyLevel: 'Autonomous',
        personalDataInvolved: true,
        deploymentModel: 'SaaS API',
      }),
    ).toBe('Critical');
  });
  it('returns Low for read-only no-PII self-hosted', () => {
    expect(
      suggestInternalRisk({
        autonomyLevel: 'Read-only',
        personalDataInvolved: false,
        deploymentModel: 'Self-hosted',
      }),
    ).toBe('Low');
  });
});
