let activeRunId = null;
let pollTimer = null;

const $ = (selector) => document.querySelector(selector);
const form = $('#run-form');

function setText(selector, value) { $(selector).textContent = value; }
function escapeHtml(value) { return String(value).replace(/[&<>"']/g, (char) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[char])); }

function renderRun(run) {
  setText('#run-id', run.runId || '—');
  setText('#state', run.state || '—');
  $('#state').className = `state ${run.state === 'CLOSED' ? 'closed' : ''}`;
  setText('#finding-count', run.findings?.length || 0);
  setText('#event-count', run.events?.length || 0);
  setText('#decision-count', run.decisions?.length || 0);
  $('#timeline').innerHTML = (run.events || []).map((event) => `<li><strong>${escapeHtml(event.eventType)}</strong><time>${escapeHtml(event.timestamp)}</time></li>`).join('') || '<li class="muted">Events will appear here.</li>';
  if (run.findings?.length) { $('#findings-card').classList.remove('hidden'); renderFindings(run); }
  if (run.state === 'CLOSED') { $('#packet-card').classList.remove('hidden'); loadPacket(run.runId); }
}

function renderFindings(run) {
  $('#findings').innerHTML = run.findings.map((finding) => {
    const quote = finding.evidence?.[0]?.quote ? `<blockquote>${escapeHtml(finding.evidence[0].quote)}</blockquote>` : '';
    const disposition = finding.humanDisposition?.disposition || '';
    return `<article class="finding"><div class="finding-top"><div><h3>${escapeHtml(finding.question)}</h3><span class="status-${escapeHtml(finding.status)}">${escapeHtml(finding.status)}</span></div><small>${escapeHtml(finding.findingId)} · v${finding.version}</small></div><p>${escapeHtml((finding.limitations || []).join(' ') || 'Evidence state recorded.')}</p>${quote}<select data-finding="${escapeHtml(finding.findingId)}"><option value="">Choose disposition…</option><option value="accepted" ${disposition === 'accepted' ? 'selected' : ''}>Accepted</option><option value="rejected" ${disposition === 'rejected' ? 'selected' : ''}>Rejected</option><option value="modified" ${disposition === 'modified' ? 'selected' : ''}>Modified</option><option value="escalated" ${disposition === 'escalated' ? 'selected' : ''}>Escalated</option></select><input data-note="${escapeHtml(finding.findingId)}" placeholder="Evidence note" value="${escapeHtml(finding.humanDisposition?.evidenceNote || '')}" /></article>`;
  }).join('');
  document.querySelectorAll('select[data-finding]').forEach((select) => select.addEventListener('change', () => recordDisposition(select.dataset.finding, select.value)));
}

async function recordDisposition(findingId, disposition) {
  if (!disposition || !activeRunId) return;
  const note = document.querySelector(`[data-note="${findingId}"]`).value || 'Reviewed against the declared source boundary.';
  await fetch(`/api/runs/${activeRunId}/findings/${findingId}/disposition`, { method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify({ disposition, evidenceNote:note }) });
  await poll();
}

async function poll() {
  if (!activeRunId) return;
  const response = await fetch(`/api/runs/${activeRunId}`);
  if (!response.ok) return;
  const run = await response.json(); renderRun(run);
  if (!['CLOSED', 'RUN_FAILED', 'SCOPE_BLOCKED'].includes(run.state)) pollTimer = setTimeout(poll, 700);
}

async function loadPacket(runId) {
  const response = await fetch(`/api/runs/${runId}/packet`);
  if (response.ok) $('#packet').textContent = JSON.stringify(await response.json(), null, 2);
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (pollTimer) clearTimeout(pollTimer);
  const data = Object.fromEntries(new FormData(form));
  data.publicMaterialConfirmed = form.publicMaterialConfirmed.checked;
  setText('#form-status', 'Submitting run…');
  const response = await fetch('/api/runs', { method:'POST', headers:{'content-type':'application/json','idempotency-key':`ui-${Date.now()}`}, body:JSON.stringify(data) });
  const body = await response.json();
  if (!response.ok) { setText('#form-status', body.error || 'Could not create run.'); return; }
  activeRunId = body.runId; setText('#form-status', `Run ${body.runId} queued in ${body.providerMode} mode.`); poll();
});

$('#close-run').addEventListener('click', async () => {
  if (!activeRunId) return;
  const rationale = $('#rationale').value;
  const response = await fetch(`/api/runs/${activeRunId}/close`, { method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify({ rationale }) });
  const body = await response.json(); setText('#close-status', response.ok ? 'Decision packet closed.' : body.error); renderRun(body);
});
