/**
 * Phase 4 AuditTrail — D4: payload used for canonical hash (tamper-evident).
 * Keys must appear in this order when serializing to JSON for hashing.
 * Timestamps: ISO 8601 UTC. Absences: explicit null.
 * Excluded from hash: _id, hashEvento, hashEventoAnterior.
 */
import type { AuditActionTypeValue } from '../constants/audit-action-type';

export interface AuditEventCanonicalPayload {
  proveedorSaludId: string | null;
  actorId: string | null;
  timestamp: string; // ISO 8601 UTC
  actionType: AuditActionTypeValue;
  resourceType: string | null;
  resourceId: string | null;
  payload: Record<string, unknown> | null;
}

/**
 * Key order for canonical JSON (must be stable for deterministic hash).
 */
export const CANONICAL_KEY_ORDER: (keyof AuditEventCanonicalPayload)[] = [
  'proveedorSaludId',
  'actorId',
  'timestamp',
  'actionType',
  'resourceType',
  'resourceId',
  'payload',
];
