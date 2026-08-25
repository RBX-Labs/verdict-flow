# Decision and event schemas

These schemas are intentionally small. They are the contract between agents,
workers, UI, and audit records.

## Finding

```json
{
  "findingId": "fnd_01",
  "runId": "run_01",
  "version": 1,
  "scope": "claim_method_fit",
  "question": "Does the supplied excerpt connect the reported claim to the described method?",
  "status": "supported",
  "evidence": [{
    "sourceUrl": "https://example.org/public-paper",
    "quote": "Exact text copied from the supplied excerpt",
    "locator": "excerpt:paragraph-3"
  }],
  "limitations": [],
  "provider": "vertex_ai",
  "model": "gemini-3.5",
  "humanDisposition": null,
  "createdAt": "ISO-8601"
}
```

Allowed `status` values:

```text
supported | not_established | contradictory | blocked | invalidated
```

Allowed human dispositions:

```text
accepted | rejected | modified | escalated
```

## Decision version

```json
{
  "decisionId": "dec_01",
  "runId": "run_01",
  "version": 2,
  "status": "superseding",
  "findingIds": ["fnd_01", "fnd_02"],
  "humanOwner": "owner@example.org",
  "rationale": "Human-entered rationale tied to the dispositions",
  "supersedesDecisionId": "dec_00",
  "closedAt": null
}
```

## Audit event

```json
{
  "eventId": "evt_01",
  "runId": "run_01",
  "eventType": "finding.evidence_rejected",
  "actorType": "deterministic_validator",
  "actorId": "quote-validator-v1",
  "inputVersion": 1,
  "payload": {
    "findingId": "fnd_02",
    "reason": "quote_not_found_in_supplied_excerpt"
  },
  "timestamp": "ISO-8601"
}
```

## Required event types

```text
run.created
run.scope_blocked
run.queued
agent.started
agent.completed
agent.retry_scheduled
finding.created
finding.evidence_rejected
finding.disposition_recorded
decision.created
decision.superseded
run.closed
run.failed
```
