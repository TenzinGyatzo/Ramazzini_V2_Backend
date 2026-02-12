/**
 * GIIS Phase 2B: 3DES → .CIF and ZIP (single .CIF inside).
 * Uses Node crypto; key/IV from config. See docs/nom-024/giis_encryption_spec.md.
 */

import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { Readable } from 'stream';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const archiver = require('archiver') as (format: string, options?: any) => any;

const ALG = 'des-ede3-cbc';
const IV_LEN = 8;
const KEY_LEN = 24;

@Injectable()
export class GiisCryptoService {
  /**
   * Encrypt buffer with 3DES (des-ede3-cbc). Key must be 24 bytes.
   */
  encryptToCif(plainBuffer: Buffer, key: Buffer, iv?: Buffer): Buffer {
    if (key.length !== KEY_LEN) {
      throw new Error(
        `GIIS 3DES key must be ${KEY_LEN} bytes, got ${key.length}`,
      );
    }
    const ivBuf = iv ?? crypto.randomBytes(IV_LEN);
    if (ivBuf.length !== IV_LEN) {
      throw new Error(
        `GIIS 3DES IV must be ${IV_LEN} bytes, got ${ivBuf.length}`,
      );
    }
    const cipher = crypto.createCipheriv(ALG, key, ivBuf);
    return Buffer.concat([ivBuf, cipher.update(plainBuffer), cipher.final()]);
  }

  /**
   * Decrypt .CIF buffer (first 8 bytes = IV). For tests only.
   */
  decryptFromCif(cifBuffer: Buffer, key: Buffer): Buffer {
    if (key.length !== KEY_LEN) throw new Error(`Key must be ${KEY_LEN} bytes`);
    const iv = cifBuffer.subarray(0, IV_LEN);
    const payload = cifBuffer.subarray(IV_LEN);
    const decipher = crypto.createDecipheriv(ALG, key, iv);
    return Buffer.concat([decipher.update(payload), decipher.final()]);
  }

  /**
   * Create ZIP containing a single entry: ${officialBaseName}.CIF = cifBuffer.
   */
  async createZipWithCif(
    cifBuffer: Buffer,
    officialBaseName: string,
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      const archive = archiver('zip', { zlib: { level: 9 } });
      archive.on('error', reject);
      archive.on('data', (chunk: Buffer) => chunks.push(chunk));
      archive.on('end', () => resolve(Buffer.concat(chunks)));

      archive.append(Readable.from(cifBuffer), {
        name: `${officialBaseName}.CIF`,
      });
      archive.finalize();
    });
  }

  /**
   * SHA-256 hex of buffer (for audit).
   */
  sha256Hex(buffer: Buffer): string {
    return crypto.createHash('sha256').update(buffer).digest('hex');
  }
}
