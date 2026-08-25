import crypto from 'node:crypto';
import { RUN_STATES } from '../domain/states.mjs';
import { validateCreateInput, validateDisposition } from '../domain/schemas.mjs';
import { inspectSourceSafety } from '../validation/scope-validator.mjs';
import { validateFindingEvidence } from '../validation/evidence-validator.mjs';

function id(prefix) { return `${prefix}_${crypto.randomUUID()}`; }

export class WorkflowEngine {
  constructor({ repository, bus, provider, now = () => new Date().toISOString() }) {
    this.repository = repository;
    this.bus = bus;
    this.provider = provider;
    this.now = now;
    this.bus.subscribe('run.process', (message) => this.processRun(message.runId));
  }

  event(runId, eventType, payload = {}) {
    return this.repository.appendEvent({ eventId: id('evt'), runId, eventType, actorType: 'workflow_engine', payload, timestamp: this.now() });
  }

  createRun(input, idempotencyKey = id('idem')) {
    const normalized = validateCreateInput(input);
    const existing = [...this.repository.runs.values()].find((run) => run.idempotencyKey === idempotencyKey);
    if (existing) return existing;
    const run = {
      runId: id('run'), idempotencyKey, state: RUN_STATES[0], input: normalized,
      provider: this.provider.provider, model: this.provider.model, mode: this.provider.mode,
      findings: [], decisions: [], limitations: [], createdAt: this.now(), updatedAt: this.now()
    };
    this.repository.saveRun(run); this.event(run.runId, 'run.created', { providerMode: run.mode });
    run.state = 'QUEUED'; run.updatedAt = this.now(); this.repository.saveRun(run); this.event(run.runId, 'run.queued');
    this.bus.publish('run.process', { runId: run.runId });
    return this.repository.getRun(run.runId);
  }

  async processRun(runId) {
    const run = this.repository.getRun(runId);
    if (!run || ['CLOSED', 'SCOPE_BLOCKED'].includes(run.state)) return;
    try {
      run.state = 'INGESTING'; this.save(run, 'run.ingesting');
      const safety = inspectSourceSafety(run.input.excerpt);
      if (safety.blockedInstruction) {
        run.limitations.push(safety.reason); this.event(runId, 'source.instruction_blocked', { reason: safety.reason });
      }
      run.state = 'ANALYZING'; this.save(run, 'agent.started', { agent: 'fixture-provider' });
      const result = await this.provider.analyze(run.input);
      run.provider = result.provider; run.model = result.model; run.mode = result.mode;
      for (const candidate of result.findings) {
        const validation = validateFindingEvidence(candidate, run.input.excerpt);
        const finding = { ...candidate, version: 1, validation, humanDisposition: null, createdAt: this.now() };
        if (!validation.ok) { finding.status = 'invalidated'; run.limitations.push(validation.reason); this.event(runId, 'finding.evidence_rejected', { findingId: finding.findingId, reason: validation.reason }); }
        else this.event(runId, 'finding.created', { findingId: finding.findingId, status: finding.status });
        run.findings.push(finding);
      }
      run.state = 'NEEDS_HUMAN_DISPOSITION'; this.save(run, 'agent.completed', { count: run.findings.length });
    } catch (error) {
      run.state = 'RUN_FAILED'; run.limitations.push(error.message); this.save(run, 'run.failed', { message: error.message });
    }
  }

  save(run, eventType, payload = {}) { run.updatedAt = this.now(); this.repository.saveRun(run); this.event(run.runId, eventType, payload); }

  recordDisposition(runId, findingId, input) {
    const run = this.mustGet(runId); const disposition = validateDisposition(input);
    const finding = run.findings.find((item) => item.findingId === findingId);
    if (!finding) throw new Error('finding not found');
    finding.humanDisposition = { ...disposition, recordedAt: this.now() };
    this.save(run, 'finding.disposition_recorded', { findingId, disposition: disposition.disposition });
    if (run.findings.every((item) => item.humanDisposition && item.humanDisposition.evidenceNote)) run.state = 'READY_TO_CLOSE';
    this.save(run, 'run.disposition_state_changed', { state: run.state });
    return this.repository.getRun(runId);
  }

  closeRun(runId, rationale) {
    const run = this.mustGet(runId);
    if (run.state !== 'READY_TO_CLOSE') throw new Error('all findings need human dispositions before closure');
    if (typeof rationale !== 'string' || !rationale.trim()) throw new Error('rationale is required');
    const decision = { decisionId: id('dec'), version: run.decisions.length + 1, status: 'closed', findingIds: run.findings.map((f) => f.findingId), humanOwner: run.input.humanOwner, rationale, createdAt: this.now() };
    run.decisions.push(decision); run.state = 'CLOSED'; this.save(run, 'decision.created', { decisionId: decision.decisionId }); this.save(run, 'run.closed');
    return this.repository.getRun(runId);
  }

  buildDecisionPacket(runId) {
    const run = this.mustGet(runId);
    return {
      packetType: 'verdictflow.decision_packet',
      packetVersion: '0.1',
      runId: run.runId,
      state: run.state,
      source: { url: run.input.sourceUrl, scope: run.input.scope, publicMaterialConfirmed: run.input.publicMaterialConfirmed },
      provider: { provider: run.provider, model: run.model, mode: run.mode },
      findings: run.findings.map((finding) => ({
        findingId: finding.findingId,
        version: finding.version,
        scope: finding.scope,
        question: finding.question,
        status: finding.status,
        evidence: finding.evidence,
        limitations: finding.limitations,
        validation: finding.validation,
        humanDisposition: finding.humanDisposition
      })),
      decisions: run.decisions,
      limitations: run.limitations,
      events: this.repository.getEvents(runId),
      generatedAt: this.now()
    };
  }

  amendFinding(runId, findingId, patch) {
    const run = this.mustGet(runId); const finding = run.findings.find((item) => item.findingId === findingId);
    if (!finding) throw new Error('finding not found');
    const previousDecision = run.decisions.at(-1);
    if (previousDecision && previousDecision.status === 'closed') { previousDecision.status = 'superseded'; this.event(runId, 'decision.superseded', { decisionId: previousDecision.decisionId }); }
    const next = { ...finding, ...patch, version: finding.version + 1, humanDisposition: null, amendedAt: this.now() };
    run.findings = run.findings.map((item) => item.findingId === findingId ? next : item); run.state = 'REOPENED'; this.save(run, 'finding.amended', { findingId, version: next.version });
    return this.repository.getRun(runId);
  }

  mustGet(runId) { const run = this.repository.getRun(runId); if (!run) throw new Error('run not found'); return run; }
}
