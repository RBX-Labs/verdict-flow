import { DISPOSITIONS, SCOPES, assertOneOf } from './states.mjs';

export function validateCreateInput(input) {
  if (!input || typeof input !== 'object') throw new Error('request body is required');
  for (const field of ['sourceUrl', 'excerpt', 'scope', 'humanOwner']) {
    if (typeof input[field] !== 'string' || !input[field].trim()) throw new Error(`${field} is required`);
  }
  if (!input.publicMaterialConfirmed) throw new Error('publicMaterialConfirmed must be true');
  if (!/^https?:\/\//.test(input.sourceUrl)) throw new Error('sourceUrl must be http(s)');
  assertOneOf(input.scope, SCOPES, 'scope');
  return {
    sourceUrl: input.sourceUrl,
    excerpt: input.excerpt,
    scope: input.scope,
    humanOwner: input.humanOwner,
    publicMaterialConfirmed: true
  };
}

export function validateDisposition(input) {
  if (!input || typeof input.evidenceNote !== 'string' || !input.evidenceNote.trim()) {
    throw new Error('evidenceNote is required');
  }
  assertOneOf(input.disposition, DISPOSITIONS, 'disposition');
  return { disposition: input.disposition, evidenceNote: input.evidenceNote.trim() };
}
