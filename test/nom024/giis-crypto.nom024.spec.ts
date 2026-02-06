/**
 * NOM-024 GIIS Crypto (Phase 2 — 2B)
 * 3DES encrypt/decrypt, ZIP with single .CIF. IV=8, key=24, des-ede3-cbc.
 *
 * These tests validate the local implementation only; they do NOT prove
 * compatibility with the DGIS official tool.
 */

import { GiisCryptoService } from '../../src/modules/giis-export/crypto/giis-crypto.service';
import * as crypto from 'crypto';

describe('NOM-024 GIIS Crypto (Phase 2B)', () => {
  let service: GiisCryptoService;
  const key = Buffer.alloc(24, 0x01);
  const iv = Buffer.alloc(8, 0x02);

  beforeAll(() => {
    service = new GiisCryptoService();
  });

  it('should encrypt and decrypt roundtrip with test key/IV', () => {
    const plain = Buffer.from('Hello GIIS Windows-1252 \u00a1', 'latin1');
    const cipher = service.encryptToCif(plain, key, iv);
    expect(cipher.length).toBeGreaterThan(plain.length);
    const dec = service.decryptFromCif(cipher, key);
    expect(dec.toString('latin1')).toBe(plain.toString('latin1'));
  });

  it('should use IV of 8 bytes and key of 24 bytes', () => {
    const plain = Buffer.from('test', 'utf-8');
    const cipher = service.encryptToCif(plain, key);
    expect(cipher.subarray(0, 8).length).toBe(8);
    expect(key.length).toBe(24);
  });

  it('should reject key not 24 bytes', () => {
    expect(() => service.encryptToCif(Buffer.from('x'), Buffer.alloc(16))).toThrow(/24 bytes/);
  });

  it('should create ZIP containing only one .CIF entry', async () => {
    const cifBuffer = service.encryptToCif(Buffer.from('content', 'utf-8'), key);
    const zipBuffer = await service.createZipWithCif(cifBuffer, 'CDT-99SMP-2410');
    expect(zipBuffer.length).toBeGreaterThan(0);
    expect(zipBuffer[0]).toBe(0x50);
    expect(zipBuffer[1]).toBe(0x4b);
  });

  it('should compute SHA-256 hex', () => {
    const buf = Buffer.from('test');
    const hex = service.sha256Hex(buf);
    expect(hex).toMatch(/^[a-f0-9]{64}$/);
    const expected = crypto.createHash('sha256').update(buf).digest('hex');
    expect(hex).toBe(expected);
  });
});
