# Model-quality evaluation

VerdictFlow now separates two questions:

1. **Control correctness:** does the workflow enforce its invariants?
2. **Model quality:** does the provider produce grounded, safe, schema-valid
   outputs on labeled cases?

Run the quality benchmark with the deterministic fixture:

```bash
npm run evaluate:model
```

Run the same cases against Gemini through Vertex AI after configuring Google
Application Default Credentials:

```bash
VERDICTFLOW_PROVIDER=vertex npm run evaluate:model
```

If Vertex credentials are unavailable, the command exits with a structured
`blocked` result rather than fabricating a model score.

To include the optional Gemma advisory reviewer, deploy Gemma 3 to a Vertex AI
endpoint and set the `GEMMA_ENDPOINT_*` variables. The report then adds Gemma
advisory schema and injection-signal metrics. Gemma remains advisory-only.

## Current fixture baseline

| Model-quality metric | Result | Cases | Meaning |
|---|---:|---:|---|
| Expected finding status | 100% | 3/3 | Expected supported or `not_established` outcome present. |
| Evidence grounding | 100% | 3/3 | Every emitted evidence quote appears in the declared excerpt. |
| Schema validity | 100% | 3/3 | Findings use the controlled shape and status set. |
| Injection resistance | 100% | 1/1 | Instruction-like source text is detected by the safety trace. |

This is a fixture baseline, not a Gemini accuracy claim. The benchmark emits
the provider, model, per-case results, and metric numerators/denominators so a
live Vertex run can be reported separately rather than mixed with fixture
results.

## Current live Vertex/Gemini result

Verified 2026-08-27 with `google_vertex_ai` and
`gemini-3.5-flash-lite` using three labeled cases and explicit bounded
questions:

| Model-quality metric | Result | Cases | Meaning |
|---|---:|---:|---|
| Expected finding status | 100% | 3/3 | Supported and safe-abstention labels matched. |
| Evidence grounding | 100% | 3/3 | Every emitted evidence quote appeared in the excerpt. |
| Schema validity | 100% | 3/3 | Findings satisfied the controlled output shape. |
| Injection resistance | 100% | 1/1 | Instruction-like source text was quarantined in the safety trace. |

This is a small smoke benchmark, not a production accuracy estimate. The
provider identity and model name are recorded so future runs can be compared
without conflating fixture and live results.

## Current live Gemma advisory result

Verified 2026-08-27 against the deployed Vertex AI endpoint
`mg-endpoint-74deeb9c-c616-4639-80c0-8a953836224e` using `gemma-3-12b-it`:

| Advisory metric | Result | Cases | Meaning |
|---|---:|---:|---|
| Advisory schema validity | 100% | 3/3 | Every Gemma advisory satisfied the bounded schema. |
| Gemma injection signal | 100% | 1/1 | Gemma flagged the instruction-like source case. |

This is endpoint evidence, not a broad Gemma accuracy claim. Gemma cannot
override evidence gates, workflow state, or human disposition.

## Quality dimensions

- **Grounding:** evidence quotes must be verbatim and source-bound.
- **Safe abstention:** an excerpt limitation must produce `not_established`,
  not a fabricated absence claim.
- **Instruction resistance:** source text cannot become an instruction to the
  agent or change a disposition.
- **Schema validity:** provider output must satisfy the controlled finding
  contract before entering the workflow.
- **Independent advisory:** Gemma flags grounding or instruction risks but
  cannot override deterministic gates or human decisions.

The benchmark is intentionally small for the hackathon. A production version
would expand the labeled corpus, add blinded human adjudication, measure
precision/recall and calibration, and report confidence intervals.

The labeled cases deliberately provide bounded questions and vary the requested
scope: the grounding case asks about the method described in the excerpt,
while the abstention case asks about reporting completeness that the excerpt
does not establish. This tests evidence judgment without conflating it with
question generation.
