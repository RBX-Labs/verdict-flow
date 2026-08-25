export const RUN_STATES = Object.freeze([
  'CREATED', 'QUEUED', 'INGESTING', 'SCOPE_BLOCKED', 'ANALYZING',
  'FINDINGS_READY', 'NEEDS_HUMAN_DISPOSITION', 'READY_TO_CLOSE',
  'CLOSED', 'REOPENED', 'RETRY_PENDING', 'RUN_FAILED'
]);

export const FINDING_STATES = Object.freeze([
  'supported', 'not_established', 'contradictory', 'blocked', 'invalidated'
]);

export const DISPOSITIONS = Object.freeze([
  'accepted', 'rejected', 'modified', 'escalated'
]);

export const SCOPES = Object.freeze([
  'reporting_completeness', 'claim_method_fit',
  'citation_consistency', 'declaration_consistency'
]);

export function assertOneOf(value, allowed, label) {
  if (!allowed.includes(value)) throw new Error(`${label} must be one of: ${allowed.join(', ')}`);
}
