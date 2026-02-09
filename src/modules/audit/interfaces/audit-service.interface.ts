/**
 * Phase 4 AuditTrail — Contract for audit event recording (no persistence in this interface).
 */
import type { AuditActionTypeValue } from '../constants/audit-action-type';
import type { AuditEventClassValue } from '../constants/audit-event-class';

export interface RecordAuditParams {
  proveedorSaludId: string | null;
  actorId: string | null;
  actionType: AuditActionTypeValue;
  resourceType?: string | null;
  resourceId?: string | null;
  payload?: Record<string, unknown> | null;
  eventClass: AuditEventClassValue;
}

export interface IAuditService {
  record(params: RecordAuditParams): Promise<void>;
}
