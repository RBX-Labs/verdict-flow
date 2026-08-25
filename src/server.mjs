import http from 'node:http';
import { MemoryRepository } from './repositories/file-repository.mjs';
import { LocalBus } from './events/local-bus.mjs';
import { FixtureProvider } from './agents/provider-adapter.mjs';
import { WorkflowEngine } from './workflow/engine.mjs';

const repository = new MemoryRepository();
const bus = new LocalBus();
const engine = new WorkflowEngine({ repository, bus, provider: new FixtureProvider() });

function json(res, status, body) { res.writeHead(status, { 'content-type': 'application/json' }); res.end(JSON.stringify(body)); }
function readBody(req) { return new Promise((resolve, reject) => { let data = ''; req.on('data', (chunk) => { data += chunk; }); req.on('end', () => { try { resolve(data ? JSON.parse(data) : {}); } catch { reject(new Error('invalid JSON')); } }); req.on('error', reject); }); }
function errorStatus(error) { return /not found/.test(error.message) ? 404 : 400; }

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === 'GET' && req.url === '/health') return json(res, 200, { ok: true, service: 'verdictflow', providerMode: engine.provider.mode });
    if (req.method === 'POST' && req.url === '/api/runs') {
      const body = await readBody(req); const run = engine.createRun(body, req.headers['idempotency-key']);
      return json(res, 202, { runId: run.runId, state: run.state, providerMode: run.mode });
    }
    const match = req.url.match(/^\/api\/runs\/([^/]+)(?:\/findings\/([^/]+)\/(disposition|amend)|\/(close))?$/);
    if (!match) return json(res, 404, { error: 'not found' });
    const [, runId, findingId, action, close] = match;
    if (req.method === 'GET' && !action && !close) return json(res, 200, { ...engine.mustGet(runId), input: { ...engine.mustGet(runId).input, excerpt: undefined } });
    if (req.method === 'POST' && action === 'disposition') return json(res, 200, engine.recordDisposition(runId, findingId, await readBody(req)));
    if (req.method === 'POST' && action === 'amend') return json(res, 200, engine.amendFinding(runId, findingId, await readBody(req)));
    if (req.method === 'POST' && close === 'close') { const body = await readBody(req); return json(res, 200, engine.closeRun(runId, body.rationale)); }
    return json(res, 405, { error: 'method not allowed' });
  } catch (error) { return json(res, errorStatus(error), { error: error.message }); }
});

server.listen(Number(process.env.PORT || 8080), () => console.log(JSON.stringify({ event: 'server.started', port: Number(process.env.PORT || 8080), provider: engine.provider.provider, mode: engine.provider.mode })));
