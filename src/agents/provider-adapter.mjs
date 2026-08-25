export class FixtureProvider {
  constructor() {
    this.provider = 'local_fixture';
    this.model = 'deterministic-fixture-v1';
    this.mode = 'deterministic_fixture';
  }

  async analyze({ excerpt, scope }) {
    const findings = [];
    const evidenceQuote = 'The method compares the intervention group with a control group.';
    if (excerpt.includes(evidenceQuote)) {
      findings.push({
        findingId: 'fnd-method-01',
        scope,
        question: 'Does the supplied excerpt connect the reported claim to the described method?',
        status: 'supported',
        evidence: [{ quote: evidenceQuote, locator: 'excerpt:paragraph-2' }],
        limitations: []
      });
    }
    findings.push({
      findingId: 'fnd-absence-01',
      scope: 'reporting_completeness',
      question: 'Does the full paper report a preregistered analysis plan?',
      status: 'not_established',
      evidence: [],
      limitations: ['The supplied excerpt cannot establish absence from the full source.']
    });
    const citationQuote = 'The authors cite Example et al. (2024) for the measurement instrument.';
    if (excerpt.includes(citationQuote)) {
      findings.push({
        findingId: 'fnd-citation-01',
        scope: 'citation_consistency',
        question: 'Does the supplied citation appear to support the stated measurement instrument?',
        status: 'contradictory',
        evidence: [{ quote: citationQuote, locator: 'excerpt:paragraph-4' }],
        limitations: ['The cited source was not fetched in the local MVP.']
      });
    }
    return { provider: this.provider, model: this.model, mode: this.mode, findings, limitations: [] };
  }
}

export class GoogleProviderUnavailable {
  constructor() { this.provider = 'google_unconfigured'; this.model = 'unset'; this.mode = 'unavailable'; }
  async analyze() { throw new Error('Google provider is not configured; refusing to claim live Gemini execution'); }
}
