import { GiisSchema } from '../schema-loader';

export interface GiisRowValidationResult {
  valid: boolean;
  errors?: string[];
}

/**
 * Validate a single row (array of column values in schema order).
 * - Column count must match schema.fields.length.
 * - For each field with requiredColumn === true, value (trimmed) must not be empty.
 */
export function validateRow(schema: GiisSchema, row: string[]): GiisRowValidationResult {
  const errors: string[] = [];
  if (row.length !== schema.fields.length) {
    errors.push(
      `Column count ${row.length} does not match schema ${schema.fields.length}`,
    );
    return { valid: false, errors };
  }
  for (let i = 0; i < schema.fields.length; i++) {
    if (schema.fields[i].requiredColumn) {
      const val = String(row[i] ?? '').trim();
      if (val === '') {
        errors.push(`Required column ${schema.fields[i].name} (index ${i}) is empty`);
      }
    }
  }
  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}
