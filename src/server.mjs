import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { FileRepository } from './repositories/file-repository.mjs';
import { LocalBus } from './events/local-bus.mjs';
import { FixtureProvider } from './agents/provider-adapter.mjs';
import { VertexGenAIProvider } from './agents/google-genai-provider.mjs';
import { WorkflowEngine } from './workflow/engine.mjs';

const repository = new FileRepository(path.join(process.cwd(), '.data', 'verdictflow.json'));
const bus = new LocalBus();
const provider = process.env.VERDICTFLOW_PROVIDER === 'vertex' ? new VertexGenAIProvider() : new FixtureProvider();
const engine = new WorkflowEngine({ repository, bus, provider });

function json(res, status, body) { res.writeHead(status, { 'content-type': 'application/json' }); res.end(JSON.stringify(body)); }
function staticFile(res, filePath, contentType) { res.writeHead(200, { 'content-type': contentType }); res.end(fs.readFileSync(filePath)); }
function readBody(req) { return new Promise((resolve, reject) => { let data = ''; req.on('data', (chunk) => { data += chunk; }); req.on('end', () => { try { resolve(data ? JSON.parse(data) : {}); } catch { reject(new Error('invalid JSON')); } }); req.on('error', reject); }); }
function errorStatus(error) { return /not found/.test(error.message) ? 404 : 400; }

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === 'GET' && req.url === '/health') return json(res, 200, { ok: true, service: 'verdictflow', providerMode: engine.provider.mode });
    if (req.method === 'GET' && req.url === '/') return staticFile(res, path.join(process.cwd(), 'public', 'index.html'), 'text/html; charset=utf-8');
    if (req.method === 'GET' && req.url === '/app.js') return staticFile(res, path.join(process.cwd(), 'public', 'app.js'), 'text/javascript; charset=utf-8');
    if (req.method === 'GET' && req.url === '/styles.css') return staticFile(res, path.join(process.cwd(), 'public', 'styles.css'), 'text/css; charset=utf-8');
    if (req.method === 'POST' && req.url === '/api/runs') {
      const body = await readBody(req); const run = engine.createRun(body, req.headers['idempotency-key']);
      return json(res, 202, { runId: run.runId, state: run.state, providerMode: run.mode });
    }
    const packetMatch = req.url.match(/^\/api\/runs\/([^/]+)\/packet$/);
    if (req.method === 'GET' && packetMatch) return json(res, 200, engine.buildDecisionPacket(packetMatch[1]));
    const match = req.url.match(/^\/api\/runs\/([^/]+)(?:\/findings\/([^/]+)\/(disposition|amend)|\/(close))?$/);
    if (!match) return json(res, 404, { error: 'not found' });
    const [, runId, findingId, action, close] = match;
    if (req.method === 'GET' && !action && !close) { const run = engine.mustGet(runId); return json(res, 200, { ...run, input: { ...run.input, excerpt: undefined }, events: repository.getEvents(runId) }); }
    if (req.method === 'POST' && action === 'disposition') return json(res, 200, engine.recordDisposition(runId, findingId, await readBody(req)));
    if (req.method === 'POST' && action === 'amend') return json(res, 200, engine.amendFinding(runId, findingId, await readBody(req)));
    if (req.method === 'POST' && close === 'close') { const body = await readBody(req); return json(res, 200, engine.closeRun(runId, body.rationale)); }
    return json(res, 405, { error: 'method not allowed' });
  } catch (error) { return json(res, errorStatus(error), { error: error.message }); }
});

server.listen(Number(process.env.PORT || 8080), () => console.log(JSON.stringify({ event: 'server.started', port: Number(process.env.PORT || 8080), provider: engine.provider.provider, mode: engine.provider.mode })));
