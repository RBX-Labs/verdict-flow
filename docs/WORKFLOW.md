# VerdictFlow actual workflow

This is the behavior contract for the MVP and demo. Anything not described
here is out of scope until deliberately added and verified.

## Input contract

A run requires:

- A public source URL
- A pasted public excerpt or uploaded public source artifact
- A selected check scope
- A named human owner
- Confirmation that the material is public and authorized for this exercise

The MVP does not accept confidential manuscripts or private reviewer material.

## State machine

```text
CREATED
  -> QUEUED
  -> INGESTING
  -> SCOPE_BLOCKED | ANALYZING
  -> FINDINGS_READY
  -> NEEDS_HUMAN_DISPOSITION
  -> READY_TO_CLOSE
  -> CLOSED

ANALYZING -> RETRY_PENDING -> ANALYZING
ANALYZING -> RUN_FAILED
NEEDS_HUMAN_DISPOSITION -> REOPENED when a finding changes
CLOSED -> REOPENED when supporting evidence or a finding changes
REOPENED -> NEEDS_HUMAN_DISPOSITION
```

## Step-by-step execution

### 1. Create run

The API validates required fields, generates a collision-resistant `runId`,
stores the input metadata, and emits `run.created`.

### 2. Validate scope

The Scope and Safety Agent checks that the source is declared public, the
selected check is allowed, and the input does not contain an instruction that
attempts to override system policy.

If scope fails, the run becomes `SCOPE_BLOCKED`; no model-generated finding is
treated as a result.

### 3. Extract bounded signals

The Intake Agent creates candidate claims and questions only within the chosen
scope. Example scopes:

- Reporting completeness
- Claim-method fit
- Citation consistency
- Declaration consistency

Forbidden scopes:

- Novelty
- Author intent
- Publication worthiness
- Accept/reject prediction
- Broad ethics judgment

### 4. Run specialist checks

The Evidence Check Agent and specialist checks run through Pub/Sub. Each output
must contain either an exact quote from the supplied excerpt or an explicit
`not_established` explanation.

### 5. Validate model output

Deterministic code verifies JSON shape, quote presence, source boundaries, and
allowed labels. Invalid findings are excluded individually and recorded in the
run limitations.

### 6. Create human tasks

Each surviving finding becomes a task for the named owner with:

- Source link
- Exact evidence or evidence gap
- Bounded question
- Model/provider identity
- Limitation
- Disposition options: `accepted`, `rejected`, `modified`, `escalated`

### 7. Close only after dispositions

The API blocks closure until every finding has an evidence note and one human
disposition. The human outcome is a decision record, not an AI verdict.

### 8. Generate decision packet

The Synthesis Agent creates a packet containing validated findings,
dispositions, unresolved limitations, provider/model metadata, and the final
human rationale. It cannot add unsupported findings.

### 9. Reopen safely

If a finding or supporting evidence changes, the previous outcome is marked
`superseded`, a new version is created, and the run returns to
`NEEDS_HUMAN_DISPOSITION`. History is append-only from the user’s perspective.

## Concrete demo fixture

The demo fixture must contain:

1. A claim whose supporting sentence appears verbatim.
2. A missing-method claim that the excerpt cannot establish.
3. A citation inconsistency.
4. An instruction hidden in the source text telling the agent to ignore policy.
5. A later finding edit that supersedes the first decision.

Expected visible outcomes:

| Fixture | Expected result |
|---|---|
| Exact supporting quote | Finding eligible for human disposition |
| Missing fact from excerpt | `not_established`; verification task |
| Citation mismatch | Bounded question with linked citation evidence |
| Hidden instruction | Block or quarantine event; never obeyed |
| Edited finding | Prior outcome superseded; new disposition required |
