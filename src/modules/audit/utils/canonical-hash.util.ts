/**
 * Phase 4 AuditTrail — D4: SHA-256 of canonical JSON (tamper-evident).
 * No Mongoose/Nest dependencies; pure Node.
 */
import { createHash } from 'crypto';
import type { AuditEventCanonicalPayload } from '../interfaces/audit-event-canonical.interface';
import { CANONICAL_KEY_ORDER } from '../interfaces/audit-event-canonical.interface';

function buildCanonicalObject(
  event: AuditEventCanonicalPayload,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const key of CANONICAL_KEY_ORDER) {
    const v = event[key];
    if (v === undefined) {
      out[key] = null;
    } else {
      out[key] = v;
    }
  }
  return out;
}

/**
 * Serializes payload to canonical JSON (stable key order, explicit null).
 */
export function toCanonicalJson(event: AuditEventCanonicalPayload): string {
  const obj = buildCanonicalObject(event);
  return JSON.stringify(obj);
}

/**
 * Computes hashEvento (SHA-256 hex) and optional hashEventoAnterior for chain.
 */
export function computeCanonicalHash(
  event: AuditEventCanonicalPayload,
  previousEventHash?: string | null,
): { hashEvento: string; hashEventoAnterior: string | null } {
  const json = toCanonicalJson(event);
  const hashEvento = createHash('sha256').update(json, 'utf8').digest('hex');
  return {
    hashEvento,
    hashEventoAnterior: previousEventHash ?? null,
  };
}
