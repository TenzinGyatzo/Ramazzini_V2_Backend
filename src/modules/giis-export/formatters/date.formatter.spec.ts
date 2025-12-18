import { toAAAAMMDD, toDDMMAAAA, toHHMM } from './date.formatter';

describe('Date Formatter', () => {
  describe('toAAAAMMDD', () => {
    it('should format Date object to YYYYMMDD', () => {
      const date = new Date('2024-03-15T10:30:00Z');
      expect(toAAAAMMDD(date)).toBe('20240315');
    });

    it('should format ISO string to YYYYMMDD', () => {
      expect(toAAAAMMDD('2024-03-15T10:30:00Z')).toBe('20240315');
    });

    it('should handle single digit month and day with padding', () => {
      const date = new Date('2024-01-05T00:00:00Z');
      expect(toAAAAMMDD(date)).toBe('20240105');
    });

    it('should return empty string for null', () => {
      expect(toAAAAMMDD(null)).toBe('');
    });

    it('should return empty string for undefined', () => {
      expect(toAAAAMMDD(undefined)).toBe('');
    });

    it('should return empty string for invalid date string', () => {
      expect(toAAAAMMDD('not-a-date')).toBe('');
    });

    it('should return empty string for invalid Date object', () => {
      const invalidDate = new Date('invalid');
      expect(toAAAAMMDD(invalidDate)).toBe('');
    });

    it('should handle year boundaries (December -> January)', () => {
      expect(toAAAAMMDD('2023-12-31T00:00:00Z')).toBe('20231231');
      expect(toAAAAMMDD('2024-01-01T00:00:00Z')).toBe('20240101');
    });

    it('should use UTC to avoid timezone issues', () => {
      // This date at midnight UTC might be different day in local timezone
      const date = new Date('2024-03-15T00:00:00Z');
      expect(toAAAAMMDD(date)).toBe('20240315');
    });
  });

  describe('toDDMMAAAA', () => {
    it('should format Date object to DD/MM/YYYY', () => {
      const date = new Date('2024-03-15T10:30:00Z');
      expect(toDDMMAAAA(date)).toBe('15/03/2024');
    });

    it('should format ISO string to DD/MM/YYYY', () => {
      expect(toDDMMAAAA('2024-03-15T10:30:00Z')).toBe('15/03/2024');
    });

    it('should handle single digit month and day with padding', () => {
      const date = new Date('2024-01-05T00:00:00Z');
      expect(toDDMMAAAA(date)).toBe('05/01/2024');
    });

    it('should return empty string for null', () => {
      expect(toDDMMAAAA(null)).toBe('');
    });

    it('should return empty string for undefined', () => {
      expect(toDDMMAAAA(undefined)).toBe('');
    });

    it('should return empty string for invalid date', () => {
      expect(toDDMMAAAA('not-a-date')).toBe('');
    });
  });

  describe('toHHMM', () => {
    it('should format HH:mm to HHMM', () => {
      expect(toHHMM('14:30')).toBe('1430');
    });

    it('should handle single digit hours', () => {
      expect(toHHMM('9:05')).toBe('0905');
    });

    it('should handle midnight', () => {
      expect(toHHMM('00:00')).toBe('0000');
    });

    it('should handle end of day', () => {
      expect(toHHMM('23:59')).toBe('2359');
    });

    it('should return empty string for null', () => {
      expect(toHHMM(null)).toBe('');
    });

    it('should return empty string for undefined', () => {
      expect(toHHMM(undefined)).toBe('');
    });

    it('should return empty string for invalid format', () => {
      expect(toHHMM('invalid')).toBe('');
      expect(toHHMM('25:00')).toBe(''); // Invalid hour handled by regex
    });

    it('should return empty string for empty string', () => {
      expect(toHHMM('')).toBe('');
    });
  });
});
