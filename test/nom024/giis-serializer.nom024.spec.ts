/**
 * NOM-024 GIIS Serializer Tests (Phase 1 — 1B)
 * Schema-driven: header and column order from schema only.
 */

import { loadGiisSchema } from '../../src/modules/giis-export/schema-loader';
import { GiisSerializerService } from '../../src/modules/giis-export/giis-serializer.service';

describe('NOM-024 GIIS Serializer (Phase 1B)', () => {
  let serializer: GiisSerializerService;

  beforeAll(() => {
    serializer = new GiisSerializerService();
  });

  describe('schema-driven serialize', () => {
    it('should load CEX schema and serialize 0 rows to header line only', () => {
      const schema = loadGiisSchema('CEX');
      const out = serializer.serialize(schema, []);
      const lines = out.split('\n');
      expect(lines.length).toBe(1);
      const headerCols = lines[0].split(schema.delimiter);
      expect(headerCols.length).toBe(schema.fields.length);
      expect(headerCols[0]).toBe('clues');
      expect(headerCols[1]).toBe('paisNacimiento');
    });

    it('should serialize 1 row with same column count as schema', () => {
      const schema = loadGiisSchema('CEX');
      const row: Record<string, string | number> = {};
      schema.fields.forEach((f) => {
        row[f.name] = f.requiredColumn
          ? f.type?.kind === 'numeric'
            ? 0
            : 'XX'
          : '';
      });
      const out = serializer.serialize(schema, [row]);
      const lines = out.split('\n');
      expect(lines.length).toBe(2);
      const headerCols = lines[0].split(schema.delimiter);
      const dataCols = lines[1].split(schema.delimiter);
      expect(headerCols.length).toBe(schema.fields.length);
      expect(dataCols.length).toBe(schema.fields.length);
    });
  });
});
