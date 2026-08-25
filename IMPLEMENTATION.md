# VerdictFlow implementation grounding

This document is the implementation source of truth. If another document,
conversation, or generated suggestion conflicts with it, this document wins
until deliberately revised.

## Build objective

Build a locally runnable and Google-Cloud-deployable Taskmaster MVP that:

1. Accepts a public source URL, excerpt, check scope, and human owner.
2. Creates an idempotent evidence run.
3. Executes bounded specialist checks asynchronously.
4. Rejects unsupported evidence links deterministically.
5. Creates human disposition tasks.
6. Blocks closure until all findings are dispositioned.
7. Generates a versioned decision packet.
8. Reopens safely when a finding changes.

## Explicit non-goals

- No confidential-manuscript workflow.
- No accept/reject or publication-worthiness prediction.
- No author contact or external outreach in the public-paper demo.
- No claim that local fallback output is Gemini output.
- No claim of Google Cloud execution until live deployment evidence exists.
- No broad peer-review replacement product.
- No provider-switching fallback for a provider-only evaluation run.

## Implementation stack

### Local MVP

- Node.js, ESM JavaScript
- Built-in HTTP server unless an existing dependency is justified
- In-memory repository for deterministic local development
- Deterministic validator for evidence and state transitions
- Provider adapter interface with a clearly labeled local fixture provider

### Google deployment seam

- Gemini 3.5+ through Vertex AI or Gemini API
- Google ADK adapter
- Cloud Run service
- Pub/Sub adapter with retry and dead-letter configuration
- Firestore repository adapter
- Cloud Storage artifact adapter
- Structured JSON logs with `runId`, `eventId`, and `traceId`

The local MVP must work without credentials. Google adapters must fail clearly
when credentials or configuration are absent; they must never silently pretend
to be live.

## Fixed repository layout

```text
verdictflow/
  IMPLEMENTATION.md
  README.md
  package.json
  src/
    server.mjs
    config.mjs
    domain/
      states.mjs
      schemas.mjs
      errors.mjs
    workflow/
      create-run.mjs
      process-run.mjs
      dispositions.mjs
      close-run.mjs
      reopen-run.mjs
    agents/
      intake-agent.mjs
      evidence-agent.mjs
      scope-agent.mjs
      synthesis-agent.mjs
      provider-adapter.mjs
    validation/
      evidence-validator.mjs
      scope-validator.mjs
      output-validator.mjs
    repositories/
      file-repository.mjs
      firestore-repository.mjs
    events/
      event-log.mjs
      local-bus.mjs
      pubsub-bus.mjs
    artifacts/
      local-artifact-store.mjs
      gcs-artifact-store.mjs
    fixtures/
      messy-public-paper.json
  test/
    workflow.test.mjs
    validation.test.mjs
    idempotency.test.mjs
  public/
    index.html
    app.js
    styles.css
  docs/
    ARCHITECTURE.md
    WORKFLOW.md
    SCHEMAS.md
    SAFETY_CONTRACT.md
    PRIOR_WORK.md
    DEVPOST_SUBMISSION.md
    architecture-diagram.png
  deployment/
    Dockerfile
    cloudbuild.yaml
    pubsub.md
    firestore.md
```

## Domain rules

### Run states

```text
CREATED
QUEUED
INGESTING
SCOPE_BLOCKED
ANALYZING
FINDINGS_READY
NEEDS_HUMAN_DISPOSITION
READY_TO_CLOSE
CLOSED
REOPENED
RETRY_PENDING
RUN_FAILED
```

### Finding states

```text
supported
not_established
contradictory
blocked
invalidated
```

### Human dispositions

```text
accepted
rejected
modified
escalated
```

### Mandatory invariant

Every actionable finding must contain an exact quote present in the declared
excerpt. If the excerpt cannot establish the fact, the finding must be
`not_established` and produce a verification task.

## Local API contract

### `POST /api/runs`

Creates a run.

Required body:

```json
{
  "sourceUrl": "https://example.org/public-paper",
  "excerpt": "public source text",
  "scope": "claim_method_fit",
  "humanOwner": "owner@example.org",
  "publicMaterialConfirmed": true
}
```

Returns `202` with:

```json
{
  "runId": "run_...",
  "state": "QUEUED",
  "providerMode": "local_fixture"
}
```

### `GET /api/runs/:runId`

Returns the current run projection, findings, dispositions, limitations, and
event summary. It must be bounded and must not return large source artifacts.

### `POST /api/runs/:runId/findings/:findingId/disposition`

Required body:

```json
{
  "disposition": "accepted",
  "evidenceNote": "Human rationale tied to the supplied evidence."
}
```

### `POST /api/runs/:runId/close`

Closes only when every finding has a valid human disposition and evidence note.

### `POST /api/runs/:runId/findings/:findingId/amend`

Creates a new finding version, marks any active decision superseded, and moves
the run to `REOPENED`.

## Provider contract

All providers return the same normalized shape:

```json
{
  "provider": "local_fixture | vertex_ai | gemini_api",
  "model": "explicit-model-id",
  "mode": "live | deterministic_fixture",
  "findings": [],
  "limitations": []
}
```

The UI and audit events must display provider, model, and mode. A deterministic
fixture is valid for local workflow tests but is not evidence of model quality.

## Acceptance criteria

The MVP is not complete until all of these pass:

- [ ] A run can be created with the required input contract.
- [ ] Duplicate create requests with the same idempotency key do not duplicate work.
- [ ] The fixture produces at least one supported finding.
- [ ] The fixture produces at least one `not_established` finding.
- [ ] A quote not present in the excerpt is rejected by code.
- [ ] Hidden source instructions cannot change policy or permissions.
- [ ] Findings run through the async local bus and emit correlated events.
- [ ] Closure is blocked until every finding has a disposition and evidence note.
- [ ] Closure produces a versioned decision packet.
- [ ] Amending a finding preserves the previous decision as superseded.
- [ ] Invalid provider output fails one finding without corrupting the run.
- [ ] Retry behavior is idempotent.
- [ ] `GET` responses are bounded and omit raw source payloads.
- [ ] Tests cover the happy path, evidence failure, scope block, retry, closure gate, and reopen path.
- [ ] Google adapter absence is reported honestly and does not masquerade as live execution.

## Build order

1. Domain states, schemas, errors, and deterministic validators.
2. File repository and event log.
3. Local provider fixture and local async bus.
4. Run creation, processing, disposition, closure, and reopen workflows.
5. HTTP API and bounded projections.
6. Tests for all acceptance criteria.
7. Vertex/GenAI provider adapter.
8. Firestore, Pub/Sub, Cloud Storage, and Cloud Run adapters.
9. Demo UI and live Google Cloud evidence capture.
10. Devpost copy update from verified implementation facts only.

## Evidence ledger

Record implementation proof here as it becomes real:

| Claim | Evidence location | Status |
|---|---|---|
| Local workflow passes | `npm test`: 6 passing tests | VERIFIED |
| Gemini 3.5+ used | provider log/model ID | PENDING |
| ADK orchestrates agents | ADK trace | PENDING |
| Cloud Run deployed | service URL/revision | PENDING |
| Pub/Sub async execution | message/event log | PENDING |
| Firestore persistence | document IDs/screenshots | PENDING |
| Cloud Storage artifacts | object IDs | PENDING |
| Cloud Logging/OpenTelemetry | trace export | PENDING |
| Demo video recorded | public URL | PENDING |

Never change `PENDING` to `VERIFIED` without attaching the evidence location.

## Current audit snapshot

Verified locally:

- Review Console files and local HTTP routes
- Deterministic fixture workflow
- Async local event dispatch
- Local JSON persistence seam
- Decision-packet generation
- Exact-quote validation
- Source-instruction quarantine
- Idempotency
- Human disposition and closure gate
- Superseded decision reopening
- Six automated tests passing

Not implemented or not verified yet:

- Review Console UI
- Decision-packet artifact generation
- Real Gemini/Vertex AI provider
- Google ADK orchestration
- Pub/Sub adapter and dead-letter behavior
- Firestore persistence
- Cloud Storage artifacts
- Cloud Run deployment
- OpenTelemetry export
- Public hosted demo and four-minute video
