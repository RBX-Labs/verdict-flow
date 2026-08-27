# VerdictFlow

## Evidence-bound decision assurance

VerdictFlow is a decision-assurance layer for AI-assisted workflows. It
compiles model output into evidence-bound, human-owned decisions: each claim
must bind to declared source material, pass deterministic gates, receive a
human disposition, and remain replayable when the evidence changes.

The differentiator is the decision lineage, not another AI opinion:

```text
model output
  -> evidence binding
  -> deterministic validation
  -> human disposition
  -> versioned decision packet
  -> reopen when evidence changes
```

The hackathon demonstration uses a public research-paper excerpt as the first
vertical. VerdictFlow is not an AI peer reviewer, publisher workflow, or
accept/reject engine; research review is the example, while decision assurance
is the product category.

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

## Product wedge

The first buyer is a research-integrity or regulated-review team that already
uses AI to assist evidence-heavy decisions but cannot defend how a conclusion
was reached. VerdictFlow reduces unsupported conclusions, preserves review
lineage, and makes human accountability explicit.

The expansion path is deliberately adjacent: research review first, then AI
safety evaluation, compliance review, incident response, and enterprise AI
governance. The reusable product is the decision-assurance layer; the research
paper is the focused demonstration.

## Source-of-truth documents

- [Architecture](docs/ARCHITECTURE.md)
- [Actual workflow](docs/WORKFLOW.md)
- [Decision and event schemas](docs/SCHEMAS.md)
- [Safety and anti-hallucination contract](docs/SAFETY_CONTRACT.md)
- [Prior work disclosure](docs/PRIOR_WORK.md)
- [Evaluation and benchmark results](docs/EVALUATION.md)
- [Model-quality evaluation](docs/MODEL_EVALUATION.md)

## Current implementation status

The working MVP implements a Review Console, Gemini/Vertex AI provider seam,
deterministic evidence-bound verification, explicit human verification tasks,
four bounded Gemini agents (intake, evidence, scope/safety, synthesis) with
parallel specialist checks, source-instruction quarantine, an async local bus,
local persistence,
human disposition gates, decision-packet generation, idempotency, versioned
reopening, an HTTP API, and tests. An optional Gemma 3 advisory adapter can
independently review grounding and instruction-like source text; it is enabled
only when a deployed Vertex AI Gemma endpoint is explicitly configured.

Google Cloud deployment and live Gemini execution use the official Google Gen
AI SDK through Vertex AI. The deterministic fixture remains the default local
mode; set `VERDICTFLOW_PROVIDER=vertex`, `GOOGLE_CLOUD_PROJECT`, and
`GEMINI_MODEL` (default `gemini-3.5-flash-lite`, location `global`) to run
against Vertex AI. Pub/Sub, Firestore, and Cloud Storage adapters remain
planned; provisioned resources are not claimed as runtime integrations.

Run locally:

```bash
npm ci
npm test
npm start
```

Then open `http://localhost:8080`.

## Reproducible testing

Prerequisites: Node.js 22 or newer and npm. The default local mode uses the
deterministic fixture, so no Google credentials are required.

Expected test result:

```text
11 passing tests
```

To exercise the API without the UI, start the server and create a run:

```bash
curl -sS -X POST http://localhost:8080/api/runs \
  -H 'content-type: application/json' \
  -H 'idempotency-key: readme-smoke-001' \
  -d '{"sourceUrl":"https://example.org/public-paper","excerpt":"The method compares the intervention group with a control group.","scope":"claim_method_fit","humanOwner":"owner@example.org","publicMaterialConfirmed":true}'
```

Use the returned `runId` with:

```bash
curl http://localhost:8080/api/runs/RUN_ID
curl http://localhost:8080/api/runs/RUN_ID/packet
```

The expected workflow reaches `NEEDS_HUMAN_DISPOSITION`, produces an
`evidence_verified` finding, and creates a `human_verification` task for any
`not_established` finding.

To evaluate provider output quality separately from workflow-control tests:

```bash
npm run evaluate:model
VERDICTFLOW_PROVIDER=vertex npm run evaluate:model
```

The first command reports a deterministic fixture baseline. The second runs
the same labeled cases through Gemini on Vertex AI and reports provider/model
identity with the measured score denominators.

## Live Vertex AI mode

Live mode requires Google Application Default Credentials with Vertex AI access:

```bash
gcloud auth application-default login
export VERDICTFLOW_PROVIDER=vertex
export GOOGLE_CLOUD_PROJECT=verdictflow-506618
export GOOGLE_CLOUD_LOCATION=global
export GEMINI_MODEL=gemini-3.5-flash-lite
npm start
```

Optional Gemma advisory review requires a separately deployed Vertex AI
endpoint (the adapter does not silently create or assume one):

```bash
export GEMMA_ENDPOINT_ID=YOUR_DEPLOYED_ENDPOINT_ID
export GEMMA_LOCATION=us-central1
export GEMMA_MODEL=gemma-3-12b-it
npm start
```

Gemma is an advisory safety signal. Exact-quote validation, workflow state
transitions, human disposition, and closure gates remain authoritative.

The local fixture remains the safe reproducibility path. Never describe its
output as Gemini output.

## Hosted demo status

Judge-accessible public demo: GitHub Pages from this repository's `site/`
directory. The Pages workflow publishes the same-repository fixture demo with
the complete run → human task → decision packet → reopen lifecycle. The final
URL is generated by GitHub after Pages is enabled; do not submit the old
separate-host URL.

Verified Gemini/Vertex AI backend:

`https://verdictflow-628812601211.us-central1.run.app`

This Cloud Run service is private because the Google Cloud organization policy
blocks the `allUsers` Cloud Run Invoker binding. An authorized project member
can test it with an identity token:

```bash
TOKEN="$(gcloud auth print-identity-token)"
curl -H "Authorization: Bearer $TOKEN" \
  https://verdictflow-628812601211.us-central1.run.app/health
```

When GitHub Pages is enabled, the public demo is the judge-facing hosted URL;
the Cloud Run URL is backend evidence and authorized-test material.
