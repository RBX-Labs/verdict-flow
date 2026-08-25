import fs from 'node:fs';
import path from 'node:path';

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

export class FileRepository extends MemoryRepository {
  constructor(filePath) {
    super();
    this.filePath = filePath;
    this.load();
  }

  load() {
    try {
      const saved = JSON.parse(fs.readFileSync(this.filePath, 'utf8'));
      this.runs = new Map(saved.runs || []);
      this.events = saved.events || [];
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
  }

  persist() {
    fs.mkdirSync(path.dirname(this.filePath), { recursive: true });
    fs.writeFileSync(this.filePath, JSON.stringify({ runs: [...this.runs], events: this.events }, null, 2));
  }

  saveRun(run) { const result = super.saveRun(run); this.persist(); return result; }
  appendEvent(event) { const result = super.appendEvent(event); this.persist(); return result; }
}
