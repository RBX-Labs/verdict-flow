# VerdictFlow Devpost submission pack

This file is the working source of truth for the Devpost form. Replace every
`PENDING` item only after the implementation or evidence exists. Do not claim a
service, model, integration, hosted URL, or test result that has not been
verified.

## Project overview

### Project name

**VerdictFlow — Evidence Relay**

This is under Devpost's 60-character project-name limit.

### Elevator pitch

**An autonomous Gemini agent that verifies AI-assisted decisions, routes uncertainty to a human owner, and preserves the complete evidence and action trail.**

This is under Devpost's 200-character elevator-pitch limit.

### Category

**Taskmaster**

Reason: the system receives an event, performs a multi-step asynchronous
workflow, creates follow-up work, waits for required human dispositions, and
reopens the workflow when evidence changes.

## Project details: About the project

```markdown
## Inspiration

AI systems can produce convincing findings, but they do not automatically prove
what evidence supports those findings, who authorized the next action, or what
changed later. RBX Labs' public-paper decision-trace and Runtime Trust work
inspired us to build the missing accountability layer.

## What it does

VerdictFlow is an asynchronous evidence harness for AI-assisted decisions. It:

- Validates AI findings against declared source material.
- Separates verified evidence from inference and missing information.
- Routes uncertainty to a named human owner.
- Preserves decision history, including superseded outcomes.

For the demo, it processes a public research-paper excerpt. It is not an AI
peer reviewer and does not make publication or accept/reject decisions.

## How we built it

The local MVP implements the workflow with a deterministic fixture provider.
The hackathon deployment target uses Gemini 3.5 or newer through Vertex AI and
Google ADK:

1. Create a run with a public source, excerpt, scope, and human owner.
2. Extract bounded questions about reporting, methods, citations, or declarations.
3. Run specialist checks asynchronously through Pub/Sub.
4. Validate exact quotes, source boundaries, schemas, and safety constraints.
5. Create human dispositions: accepted, rejected, modified, or escalated.
6. Generate a decision packet and reopen the workflow when evidence changes.

The target deployment uses Cloud Run for the API and workers, Pub/Sub for
asynchronous jobs, Firestore for state and versions, Cloud Storage for
artifacts, and Cloud Logging/OpenTelemetry for execution traces. These Google
Cloud claims remain pending until live evidence is recorded.

## Challenges we ran into

- Preventing the model from treating an excerpt limitation as proof of absence.
- Preserving human ownership without reducing the system to a static form.
- Making asynchronous retries idempotent.
- Keeping changed findings and superseded decisions visible.
- Separating provider output from deterministic fallback behavior.

## Accomplishments that we're proud of

- Exact-quote validation rejects unsupported findings.
- `not_established` is a first-class safe outcome.
- Closure is blocked until every finding has a human disposition.
- Changed findings reopen the workflow without deleting history.
- The architecture makes evidence, authorization, uncertainty, and follow-up
  reconstructable.

## What we learned

Trustworthy agents need more than a confidence score. They need explicit source
boundaries, safe abstention, human ownership, downstream verification, and
replayable failure records.

## What's next for VerdictFlow — Evidence Relay

Next, we will add adapters for other AI-assisted workflows, policy-versioned
authorization, richer replay benchmarks, and stronger multi-user audit
controls. The research-paper workflow remains the focused demonstration of the
broader evidence-relay pattern.
```

## Built with tags

Select only technologies actually present in the final implementation:

- Gemini
- Vertex AI
- Google ADK
- Cloud Run
- Pub/Sub
- Firestore
- Cloud Storage
- OpenTelemetry
- Python or TypeScript, depending on implementation
- Agent orchestration
- Human-in-the-loop
- Provenance
- Audit logging
- Asynchronous workflows

## Try it out links

| Devpost field | Value |
|---|---|
| Hosted project URL | `PENDING — Cloud Run URL after deployment` |
| Code repository | `PENDING — public GitHub URL` |
| Demo video | `PENDING — public YouTube or Vimeo URL` |
| Architecture diagram | `verdictflow/docs/architecture-diagram.png` |

If the repository is private, grant access to:

- `testing@devpost.com`
- `cloudhackathons@google.com`

## Additional info form

| Field | Recommended entry |
|---|---|
| Submitter type | Individual, unless a real eligible team is formed |
| Country of residence | Confirm the country shown in the form before submitting |
| Category | Taskmaster |
| Organization | Leave blank unless submitting on behalf of an eligible organization |
| Project start date | Enter the actual first implementation date; do not backdate design-only work |
| Reproducible README | Yes only after the stranger-run setup has been tested |
| Google SDK | Agent Development Kit (ADK); Google GenAI SDK only if actually used |
| Google Cloud services | Cloud Run, Pub/Sub, Firestore, and Cloud Storage if implemented |
| Google AI models | Gemini 3.5 or newer; list Gemma only if actually integrated and evidenced |
| Startup prize | Leave unselected unless an incorporated organization and corporate email qualify |

## README requirements

The public repository README must include:

1. Product summary and Taskmaster category.
2. Architecture diagram.
3. Prerequisites and supported runtime versions.
4. Environment variables, with secrets described but never committed.
5. Local setup steps.
6. Google Cloud project and API enablement steps.
7. Firestore and Cloud Storage setup.
8. Pub/Sub topic, subscription, retry, and dead-letter setup.
9. ADK agent start commands.
10. Cloud Run deployment commands.
11. Seed-fixture and demo-run commands.
12. Test commands and expected results.
13. Troubleshooting and cleanup commands.
14. Prior-work and third-party disclosure.
15. Clear statement of what is implemented versus planned.

## Required demo video

Maximum: four minutes. It must be public on YouTube or Vimeo and in English or
have English subtitles.

### Script and evidence plan

| Time | Demonstration | Evidence to show |
|---|---|---|
| 0:00–0:25 | Explain the accountability problem | Product UI and one-sentence value proposition |
| 0:25–0:45 | Create a public evidence run | Source URL, scope, owner, run ID |
| 0:45–1:15 | Show asynchronous execution | Cloud Run URL/revision and Pub/Sub event |
| 1:15–1:55 | Show parallel agent checks | ADK trace and Firestore state changes |
| 1:55–2:20 | Show unsupported claim handling | Exact-quote rejection and `not_established` result |
| 2:20–2:45 | Show hidden instruction protection | Block/quarantine event; no policy override |
| 2:45–3:15 | Record human dispositions | Accepted, rejected, modified, escalated findings |
| 3:15–3:40 | Generate decision packet | Evidence, limitations, owner, rationale, trace ID |
| 3:40–3:55 | Amend a finding | Prior outcome marked superseded and workflow reopened |
| 3:55–4:00 | Confirm Google deployment | Cloud Run, Firestore, Pub/Sub, and logs visible |

The recording must show a real run. Do not use a pre-rendered animation or
claim that a simulated event came from a live Google service.

## Architecture upload

Upload the generated PNG at:

`/Users/bangabot/Documents/RBX-Labs/verdictflow/docs/architecture-diagram.png`

The diagram must show Gemini/Vertex AI, ADK, Cloud Run, Pub/Sub, Firestore,
Cloud Storage, frontend/API, deterministic validation, and audit telemetry.

## Optional bonus contributions

### Public build article or video

Potential title: **“From AI Output to Accountable Decision: Building VerdictFlow with Gemini and Google ADK”**

The public post must explicitly say:

> I created this piece of content for the purposes of entering the All Things Agentic Hackathon.

### Social post

Use the exact hashtag:

`#AllThingsAgenticHackathon`

Post only after the public project page or demo URL is ready.

### Additional Google model

Integrate Gemma only if it has a real, bounded role such as document-risk
screening or evidence-quality preclassification. Record model name, input,
output, and where it appears in the workflow. Do not add a decorative model
call solely for bonus points.

## Final submission gate

Before pressing Submit, confirm:

- [ ] Gemini 3.5+ actually ran.
- [ ] ADK actually orchestrated the workflow.
- [ ] At least one Google Cloud service actually ran.
- [ ] Category is Taskmaster.
- [ ] Project start date is accurate.
- [ ] Repository opens in an incognito window or required reviewers have access.
- [ ] README stranger-run test passed.
- [ ] Architecture PNG uploaded.
- [ ] Public demo video is four minutes or less.
- [ ] Video visibly proves Google Cloud execution.
- [ ] Hosted URL and credentials are correct, if provided.
- [ ] Prior work and third-party code are disclosed.
- [ ] Optional bonus links are public and accurate.
- [ ] Repository, video, and hosted materials are frozen after the deadline.
