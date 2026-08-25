# VerdictFlow

## Accountable AI Decision Trace

VerdictFlow is an evidence harness for AI-assisted decisions. It verifies what
an agent claims, distinguishes evidence from inference, routes uncertainty to a
human owner, and preserves the authorized action trail when the decision later
changes.

The hackathon demonstration uses a public research-paper excerpt as the
vertical. VerdictFlow is not an AI peer reviewer, publisher workflow, or
accept/reject engine.

## Hackathon category

**Taskmaster**

The event-driven workflow is:

```text
public evidence run requested
  -> claims and candidate signals extracted
  -> signals validated against exact evidence
  -> bounded questions created
  -> specialist checks run asynchronously
  -> uncertainty or disagreement escalated
  -> human disposition recorded
  -> decision packet generated
  -> later changes reopen the run without deleting history
```

## Source-of-truth documents

- [Architecture](docs/ARCHITECTURE.md)
- [Actual workflow](docs/WORKFLOW.md)
- [Decision and event schemas](docs/SCHEMAS.md)
- [Safety and anti-hallucination contract](docs/SAFETY_CONTRACT.md)
- [Prior work disclosure](docs/PRIOR_WORK.md)

## Current implementation status

The local MVP is implemented: deterministic fixture provider, bounded evidence
validation, async local event bus, human disposition gates, idempotency,
versioned reopening, HTTP API, and tests.

Google Cloud deployment, Gemini 3.5 access, ADK orchestration, and external
integrations remain pending until their adapters are implemented and live
verification evidence is recorded.
