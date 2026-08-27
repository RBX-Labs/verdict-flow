# VerdictFlow evaluation

These are deterministic acceptance results for the current MVP fixture and
end-to-end audit. They measure control correctness, not production model
accuracy or generalization.

| Control | Result | Evidence |
|---|---:|---|
| Unsupported-claim rejection rate | 100% (1/1) | Invalid provider evidence test is invalidated rather than accepted. |
| Exact-quote validation rate | 100% (2/2) | Absent quote rejected; declared quote accepted in validation tests. |
| Injection quarantine rate | 100% (2/2) | Scope validator and workflow test quarantine instruction-like source text. |
| Idempotency correctness | 100% (1/1) | Repeated idempotency key returns the same run. |
| Closure-gate correctness | 100% (2/2) | Premature close blocked; fully dispositioned run closes. |
| Reopen/supersede correctness | 100% (1/1) | Amendment creates version 2, reopens the run, and supersedes the prior decision. |

## Interpretation

The results show that the deterministic controls enforce the intended product
invariants on the fixture path. They do not establish that Gemini is accurate
on arbitrary documents. Live provider evidence is tracked separately in
`IMPLEMENTATION.md` and must be demonstrated with the authenticated Vertex AI
run.

## Customer workflow fit

VerdictFlow sits between an existing AI workflow and an approved downstream
action:

```text
existing AI workflow
  -> VerdictFlow decision assurance
  -> approved downstream action
```

The first production wedge is research-integrity and regulated-review teams.
The same control layer can later govern AI safety evaluation, compliance review,
incident response, and enterprise AI governance.
