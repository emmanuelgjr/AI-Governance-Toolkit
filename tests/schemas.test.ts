import { describe, it, expect } from 'vitest';
import { aiSystemSchema, aiiaSchema, riskSchema, exportBundleSchema } from '../src/lib/storage/schemas';

describe('aiSystemSchema', () => {
  it('rejects empty name', () => {
    expect(() => aiSystemSchema.parse({ id: '00000000-0000-0000-0000-000000000000', name: '' })).toThrow();
  });
});

describe('riskSchema', () => {
  it('rejects out-of-range likelihood', () => {
    expect(() =>
      riskSchema.parse({
        id: '00000000-0000-0000-0000-000000000000',
        title: 'x',
        description: '',
        linkedSystemIds: [],
        category: 'Security',
        inherentLikelihood: 6,
        inherentImpact: 3,
        existingControls: '',
        controlCatalogRefs: [],
        residualLikelihood: 3,
        residualImpact: 3,
        owner: 'x',
        treatment: 'Mitigate',
        actionItems: '',
        status: 'Open',
        lastReviewed: '2026-05-01',
        nextReview: '2026-08-01',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
    ).toThrow();
  });
});

describe('exportBundle round-trip', () => {
  it('parses a minimal valid bundle', () => {
    const bundle = {
      version: '1.0' as const,
      exportedAt: new Date().toISOString(),
      systems: [],
      aiias: [],
      risks: [],
    };
    expect(() => exportBundleSchema.parse(bundle)).not.toThrow();
  });
});

describe('aiia structure', () => {
  it('requires all 10 sections in shape', () => {
    const ok = {
      id: '00000000-0000-0000-0000-000000000000',
      aiSystemId: '00000000-0000-0000-0000-000000000000',
      aiSystemName: 'x',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'Draft' as const,
      sections: {
        purpose: {}, stakeholders: {}, data: {}, misuse: {}, fairness: {},
        transparency: {}, oversight: {}, robustness: {}, environmental: {}, lifecycle: {},
      },
    };
    expect(() => aiiaSchema.parse(ok)).not.toThrow();
  });
});
