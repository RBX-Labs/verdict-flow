const $ = (id) => document.getElementById(id);
const findings = [
  { id:'method', title:'Eligibility requirement is explicit', status:'EVIDENCE_VERIFIED', quote:'Submissions must include a reproducible testing section.', source:'Hackathon rules · §4' },
  { id:'access', title:'Public access is not established', status:'NOT_ESTABLISHED', quote:'The supplied excerpt does not establish anonymous judge access.', source:'Access check · 403 observed' }
];
let dispositions = { method:'', access:'' };

function renderFindings() {
  $('findings').innerHTML = findings.map((f) => `<article class="finding"><div class="finding-top"><span class="${f.status === 'EVIDENCE_VERIFIED' ? 'verified' : 'unproven'}">${f.status}</span><span>${f.id} · v1</span></div><h3>${f.title}</h3><blockquote>“${f.quote}”</blockquote><footer><span>${f.source}</span><span class="check">${f.status === 'EVIDENCE_VERIFIED' ? 'Quote matched' : 'Human task'}</span></footer>${f.status === 'EVIDENCE_VERIFIED' ? '<button data-accept="method" class="mini">Accept verified evidence</button>' : ''}</article>`).join('');
  document.querySelector('[data-accept="method"]')?.addEventListener('click', (event) => { dispositions.method = 'accepted'; event.target.textContent = 'Accepted ✓'; event.target.disabled = true; maybeEnableClose(); });
}

function showRun() {
  $('run-panel').classList.remove('hidden');
  $('what').scrollIntoView({ behavior:'smooth', block:'start' });
  $('timeline').innerHTML = [
    ['01 Intake', 'Bounded questions created'],
    ['02 Evidence', 'Exact quote checked'],
    ['03 Scope / Safety', 'Instruction quarantined'],
    ['04 Synthesis', 'Decision packet prepared']
  ].map(([title, detail]) => `<div class="event"><b>${title}</b><small>${detail}</small></div>`).join('');
  renderFindings();
}

$('run').addEventListener('click', () => { $('run').textContent = 'Workflow complete ✓'; $('run').disabled = true; showRun(); });
$('open-task').addEventListener('click', () => { $('task-panel').classList.add('hidden'); $('task-form').classList.remove('hidden'); $('task-disposition').focus(); });
$('save-task').addEventListener('click', () => {
  const value = $('task-disposition').value;
  if (!value) return;
  dispositions.access = value;
  $('task-form').classList.add('hidden');
  $('task-panel').classList.remove('hidden');
  $('task-panel').querySelector('h3').textContent = `Human task recorded: ${value}. Review the second finding before closure.`;
  $('task-panel').querySelector('p:not(.eyebrow)').textContent = 'The owner has recorded a disposition. The packet remains open until every finding has a disposition and rationale.';
  $('task-panel').querySelector('button').textContent = 'Task completed ✓';
  $('task-panel').querySelector('button').disabled = true;
  $('close-help').textContent = 'One more finding needs a disposition.';
  maybeEnableClose();
});
 $('close').addEventListener('click', () => { $('state').textContent = 'CLOSED'; $('run-title').textContent = 'Decision closed with lineage preserved'; $('packet').classList.remove('hidden'); $('close').classList.add('hidden'); $('close-panel').classList.add('hidden'); });
$('amend').addEventListener('click', () => { $('state').textContent = 'REOPENED · DECISION V1 SUPERSEDED'; $('packet').querySelector('h3').textContent = 'Finding v2 requires fresh human review.'; $('packet').querySelector('p:not(.eyebrow)').textContent = 'The prior decision remains preserved and is marked superseded. VerdictFlow reopens changed evidence instead of silently overwriting history.'; $('amend').textContent = 'Reopened ✓'; $('amend').disabled = true; });

function maybeEnableClose() {
  if (dispositions.access && dispositions.method && $('rationale').value.trim()) { $('close').disabled = false; $('close-help').textContent = 'Ready: all findings have dispositions and rationale.'; }
}
$('rationale').addEventListener('input', maybeEnableClose);
document.addEventListener('change', (event) => { if (event.target.id === 'task-disposition') dispositions.access = event.target.value; maybeEnableClose(); });
