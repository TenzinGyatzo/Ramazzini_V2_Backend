/**
 * Phase 5 Audit Trail — Snapshot for signer profile events (no binaries).
 * Excludes firma and firmaConAntefirma raw data; adds 'presente' indicator if they exist.
 */
export function toSignerPayloadSnapshot(doc: any): Record<string, unknown> {
  if (!doc) return {};
  const raw = doc.toObject ? doc.toObject() : { ...doc };
  const out: Record<string, unknown> = {};
  for (const key of Object.keys(raw)) {
    if (key === 'firma' || key === 'firmaConAntefirma') {
      if (raw[key] != null) out[key] = 'presente';
      continue;
    }
    if (key === '__v') continue;
    out[key] = raw[key];
  }
  if (raw.firma != null && !('firma' in out)) out.firma = 'presente';
  if (raw.firmaConAntefirma != null && !('firmaConAntefirma' in out))
    out.firmaConAntefirma = 'presente';
  return out;
}
