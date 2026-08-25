export function validateFindingEvidence(finding, excerpt) {
  if (!finding || typeof finding !== 'object') return { ok: false, reason: 'finding_not_object' };
  if (!finding.findingId || !finding.question || !finding.status) return { ok: false, reason: 'required_field_missing' };
  if (!Array.isArray(finding.evidence)) return { ok: false, reason: 'evidence_must_be_array' };
  if (finding.status === 'not_established') return { ok: true };
  if (finding.evidence.length === 0) return { ok: false, reason: 'evidence_required' };
  for (const item of finding.evidence) {
    if (!item.quote || !excerpt.includes(item.quote)) return { ok: false, reason: 'quote_not_found_in_supplied_excerpt' };
  }
  return { ok: true };
}
