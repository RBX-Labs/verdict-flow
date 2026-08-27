import { FINDING_STATES, assertOneOf } from '../domain/states.mjs';

export function validateFindingEvidence(finding, excerpt) {
  if (!finding || typeof finding !== 'object') return { ok: false, reason: 'finding_not_object', verificationStatus: 'evidence_rejected' };
  if (!finding.findingId || !finding.question || !finding.status) return { ok: false, reason: 'required_field_missing', verificationStatus: 'evidence_rejected' };
  try { assertOneOf(finding.status, FINDING_STATES, 'status'); } catch { return { ok: false, reason: 'invalid_status', verificationStatus: 'evidence_rejected' }; }
  if (!Array.isArray(finding.evidence)) return { ok: false, reason: 'evidence_must_be_array', verificationStatus: 'evidence_rejected' };
  if (finding.status === 'not_established') return { ok: true, verificationStatus: 'not_established', reason: 'supplied_excerpt_does_not_establish_claim' };
  if (finding.evidence.length === 0) return { ok: false, reason: 'evidence_required', verificationStatus: 'evidence_rejected' };
  for (const item of finding.evidence) {
    if (!item || typeof item.quote !== 'string' || !item.quote.trim() || !excerpt.includes(item.quote)) {
      return { ok: false, reason: 'quote_not_found_in_supplied_excerpt', verificationStatus: 'evidence_rejected' };
    }
  }
  return { ok: true, verificationStatus: 'evidence_verified', evidenceCount: finding.evidence.length };
}
