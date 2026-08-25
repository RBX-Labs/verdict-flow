# Prior work and new hackathon contribution

## Prior RBX work leveraged

VerdictFlow reuses selected RBX Labs patterns from the existing public-paper
decision-trace demonstrator and Runtime Trust work:

- Evidence-linked questions
- Exact-quote validation
- Human dispositions
- Superseded decision history
- Provider/model metadata
- Bounded `supported`, `not_established`, and `escalated` outcomes
- Runtime evidence and audit-trace concepts

## New hackathon contribution

The hackathon project must newly implement and demonstrate:

- Gemini 3.5+ through Vertex AI or the Gemini API
- Google ADK agent orchestration
- Cloud Run API/worker deployment
- Pub/Sub asynchronous execution
- Firestore durable run and decision state
- Cloud Storage source/packet artifacts
- The new Intake → Parallel Checks → Human Disposition → Reopen workflow
- Google Cloud execution evidence and a reproducible deployment guide

The submission must not claim that pre-existing local provider runs or local
History records are Gemini, ADK, or Google Cloud output. Pre-existing source,
patterns, and artifacts will be disclosed accurately in the final submission.
