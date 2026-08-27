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

**A Gemini-powered decision-assurance layer that binds AI claims to evidence, routes uncertainty to a human owner, and preserves replayable decision lineage.**

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

VerdictFlow is an asynchronous decision-assurance layer for AI-assisted
decisions. It compiles model output into a controlled decision lineage:

- Validates AI findings against declared source material.
- Separates verified evidence from inference and missing information.
- Routes uncertainty to a named human owner.
- Preserves decision history, including superseded outcomes.

The core mechanism is **evidence relay**: model output becomes actionable only
after it is bound to declared source material, checked by deterministic gates,
and assigned a human disposition. If evidence changes, the prior decision is
superseded and the workflow reopens instead of silently overwriting history.

For the demo, it processes a public research-paper excerpt. It is not an AI
peer reviewer and does not make publication or accept/reject decisions.

## How we built it

The MVP uses four bounded Gemini agents through Vertex AI and the official
Google Gen AI SDK:

1. Create a run with a public source, excerpt, scope, and human owner.
2. Extract bounded questions about reporting, methods, citations, or declarations.
3. Run evidence and scope/safety checks in parallel through the local async workflow.
4. Validate exact quotes, source boundaries, schemas, and safety constraints.
5. Synthesize only validated findings and create explicit human verification tasks when evidence is insufficient.
6. Create human dispositions: accepted, rejected, modified, or escalated.
7. Generate a decision packet and reopen the workflow when evidence changes.

The verified deployment uses Cloud Run for the API and Vertex AI through the
Google Gen AI SDK. Pub/Sub workers, Firestore state, Cloud Storage artifacts,
and Cloud Logging/OpenTelemetry correlation remain planned and must not be
claimed as implemented services yet.

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

Our first production wedge is research-integrity and regulated-review teams
that already use AI but must defend how evidence-heavy decisions were made.
Next, we will add adapters for AI safety evaluation, compliance review,
incident response, policy-versioned authorization, richer replay benchmarks,
and stronger multi-user audit controls. The research-paper workflow remains
the focused demonstration of the broader decision-assurance pattern.
```

## Built with tags

Select only technologies actually present in the final implementation:

- Gemini
- Vertex AI
- Google Gen AI SDK (`@google/genai`)
- Cloud Run
- JavaScript / Node.js
- Agent orchestration
- Human-in-the-loop
- Provenance
- Audit logging
- Asynchronous workflows

## Evaluation evidence

The repository includes a bounded acceptance evaluation in
`docs/EVALUATION.md`. It reports unsupported-claim rejection, exact-quote
validation, injection quarantine, idempotency, closure-gate, and
reopen/supersede correctness. It also includes `docs/MODEL_EVALUATION.md` and
`npm run evaluate:model`, which separately score provider output grounding,
safe abstention, schema validity, and instruction resistance. Fixture results
are labeled separately from live Vertex/Gemini results. The current live
Gemini smoke benchmark passes 3/3 expected-status, 3/3 grounding, 3/3 schema,
and 1/1 injection cases; this is not broad production accuracy without a
larger labeled corpus.

## Try it out links

| Devpost field | Value |
|---|---|
| Hosted project URL | `PENDING — GitHub Pages URL for this repository's `/site/` demo` |
| Code repository | `https://github.com/RBX-Labs/verdict-flow` (private; share with the two Devpost reviewer accounts) |
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
| Google SDK | Google Gen AI SDK (`@google/genai`) |
| Google Cloud services | Cloud Run; add Pub/Sub, Firestore, or Cloud Storage only after adapters are implemented and evidenced |
| Google AI models | Gemini 3.5 Flash-Lite; add Gemma 3 only after the deployed advisory endpoint passes a live smoke test and is evidenced in the trace and benchmark |
| Startup prize | Leave unselected unless an incorporated organization and corporate email qualify |

### Reproducible README field

Select **Yes**. The README contains `npm ci`, `npm test`, local startup,
fixture API smoke-test, expected results, Vertex mode, and hosted-service
testing instructions. The local stranger-run path was verified separately from
the live Gemini path.

### Testing instructions field

Use this for judges:

```text
The GitHub Pages demo in the repository's `site/` directory is a credential-
free deterministic fixture. Click **Run the 30-second demo**, then follow the
visible workflow: inspect the four-agent trace, open and complete the human
task, close the packet, and amend it to show reopening and supersession. The
page deliberately labels fixture mode; it does not claim that anonymous
browser traffic invokes Gemini. The verified Gemini/Vertex AI run is recorded
in the repository implementation ledger.

Authorized testers can also inspect the private Cloud Run deployment with:

TOKEN="$(gcloud auth print-identity-token)"
curl -H "Authorization: Bearer $TOKEN" https://verdictflow-628812601211.us-central1.run.app/health

For a fully local reproducible test, clone the repository and follow the
README's `npm ci`, `npm test`, and `npm start` instructions.
```

## README requirements

The public repository README must include:

1. Product summary and Taskmaster category.
2. Architecture diagram.
3. Prerequisites and supported runtime versions.
4. Environment variables, with secrets described but never committed.
5. Local setup steps.
6. Google Cloud project and API enablement steps.
7. Firestore and Cloud Storage setup.
8. Current local workflow and Vertex provider start commands.
9. Cloud Run deployment commands.
10. Seed-fixture and demo-run commands.
11. Test commands and expected results.
12. Troubleshooting and cleanup commands.
13. Prior-work and third-party disclosure.
14. Clear statement of what is implemented versus planned.

## Required demo video

Maximum: four minutes. It must be public on YouTube or Vimeo and in English or
have English subtitles.

### Script and evidence plan

| Time | Demonstration | Evidence to show |
|---|---|---|
| 0:00–0:25 | Explain the accountability problem | Product UI and one-sentence value proposition |
| 0:25–0:45 | Create a public evidence run | Source URL, scope, owner, run ID |
| 0:45–1:15 | Show asynchronous execution | Cloud Run URL/revision and workflow event trace |
| 1:15–1:55 | Show evidence verification | Vertex request, exact quote, and explicit verification status |
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

The diagram shows the verified public demo, private Cloud Run + Vertex AI
runtime, four bounded agents, deterministic gates, human disposition, and
planned Pub/Sub/Firestore/Cloud Storage/ADK/telemetry adapters. Planned items
are visually marked and must not be selected as implemented integrations.

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
- [ ] Any optional ADK integration is actually implemented; otherwise do not select ADK.
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
