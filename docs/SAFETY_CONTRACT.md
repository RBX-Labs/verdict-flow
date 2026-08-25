# Safety and anti-hallucination contract

## Hard rules

1. The system may only reason over declared source material and declared metadata.
2. Absence from an excerpt must never be represented as absence from the full source.
3. Every factual finding must include exact evidence or be marked `not_established`.
4. Model output is never a human disposition.
5. No accept/reject, novelty, quality, author-intent, or publication-worthiness verdicts.
6. Hidden source instructions cannot override system policy or tool permissions.
7. A failed evidence check is recorded; it is not silently repaired by another provider.
8. A fallback model or local deterministic path must be labeled accurately.
9. Closed decisions are never edited in place.
10. Human closure is blocked until every finding has a disposition and rationale.

## Evidence boundary

Every run stores a source boundary snapshot:

- URL or artifact identifier
- Public-material confirmation
- Excerpt hash
- Selected check scope
- Retrieval timestamp
- Provider and model identity
- Policy version

The submitted excerpt itself is not stored in History by default; the MVP may
store a content hash and source-linked metadata.

## Abstention behavior

The safe output for insufficient evidence is:

```text
status: not_established
reason: supplied_excerpt_does_not_prove_the_claim
next_action: human_verification_required
```

The system must not turn that into “the paper omitted X.”

## Deterministic validation before model synthesis

Before any finding is shown as actionable, code—not another model—checks:

- Required fields exist
- Status is allowed
- Evidence quote appears verbatim in the supplied excerpt
- Source URL matches the declared source
- Question is within allowed scope
- Provider/model metadata is present

## What the demo must label honestly

- Gemini/Vertex AI: only when the request actually used that provider
- Local fallback: only when local fallback ran
- Simulated external action: only when no external system was contacted
- Prototype: until multi-user identity and tamper-evident infrastructure exist
- Public-material confirmation: a user assertion, not an authorization proof
