/**
 * GIIS export config (Phase 2C retention).
 * retentionMonthsForGeneratedFiles: optional; future cleanup job can use this.
 */

export const giisExportConfig = {
  get retentionMonthsForGeneratedFiles(): number | null {
    const v = process.env.RETENTION_MONTHS_GIIS_FILES;
    if (v === undefined || v === '') return null;
    const n = parseInt(v, 10);
    return Number.isNaN(n) || n < 0 ? null : n;
  },
};
