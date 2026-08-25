const INJECTION_PATTERNS = [
  /ignore\s+(all|any|previous|the)\s+(instructions|policies)/i,
  /system\s+message/i,
  /override\s+(policy|safety|scope)/i
];

export function inspectSourceSafety(excerpt) {
  const blocked = INJECTION_PATTERNS.some((pattern) => pattern.test(excerpt));
  return blocked
    ? { safe: true, blockedInstruction: true, reason: 'source_instruction_quarantined' }
    : { safe: true, blockedInstruction: false };
}
