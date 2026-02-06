import { Injectable } from '@nestjs/common';
import { GiisSchema } from './schema-loader';

/**
 * Schema-driven GIIS TXT serializer.
 * Header and column order come only from schema; no hardcoded field lists.
 */
@Injectable()
export class GiisSerializerService {
  /**
   * Serialize rows to TXT: first line = header (field names from schema), then one line per row.
   * Delimiter from schema (e.g. |). Values are stringified; empty string for missing keys.
   */
  serialize(schema: GiisSchema, rows: Record<string, string | number>[]): string {
    const delim = schema.delimiter;
    const headerLine = schema.fields.map((f) => f.name).join(delim);
    const dataLines = rows.map((row) =>
      schema.fields.map((f) => String(row[f.name] ?? '')).join(delim),
    );
    return [headerLine, ...dataLines].join('\n');
  }

  /**
   * Return the same content as a Buffer in Windows-1252 encoding for file write.
   * Node.js does not ship iconv by default; for minimal slice we return UTF-8 and document that production may use iconv-lite for windows-1252.
   */
  serializeToBuffer(schema: GiisSchema, rows: Record<string, string | number>[]): Buffer {
    const str = this.serialize(schema, rows);
    return Buffer.from(str, 'utf-8');
  }
}
