export class MemoryRepository {
  constructor() {
    this.runs = new Map();
    this.events = [];
  }

  saveRun(run) { this.runs.set(run.runId, structuredClone(run)); return this.getRun(run.runId); }
  getRun(runId) { const run = this.runs.get(runId); return run ? structuredClone(run) : null; }
  appendEvent(event) { this.events.push(structuredClone(event)); return event; }
  getEvents(runId) { return this.events.filter((event) => event.runId === runId).map((event) => structuredClone(event)); }
}
