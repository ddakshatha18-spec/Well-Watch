import { describe, expect, it } from 'vitest';
import { todayISO, validateReport } from '../lib/validate.js';

const ctx = { knownIds: ['DEMO-SRC-001'], today: '2026-10-10' };
const ok = { sourceId: 'DEMO-SRC-001', yieldLevel: 'low', failureFlag: false, date: '2026-10-10' };

describe('validateReport', () => {
  it('accepts a valid report', () => expect(validateReport(ok, ctx)).toEqual({}));
  it('requires source, yield and date', () => {
    const e = validateReport({ sourceId: '', yieldLevel: '', failureFlag: false, date: '' }, ctx);
    expect(Object.keys(e).sort()).toEqual(['date', 'sourceId', 'yieldLevel']);
  });
  it('rejects unknown sources and bad yield values', () => {
    expect(validateReport({ ...ok, sourceId: 'NOPE' }, ctx).sourceId).toBeTruthy();
    expect(validateReport({ ...ok, yieldLevel: 'huge' }, ctx).yieldLevel).toBeTruthy();
  });
  it('rejects future, impossible and ancient dates', () => {
    expect(validateReport({ ...ok, date: '2026-10-11' }, ctx).date).toMatch(/future/);
    expect(validateReport({ ...ok, date: '2026-02-30' }, ctx).date).toMatch(/real date/);
    expect(validateReport({ ...ok, date: '1999-01-01' }, ctx).date).toMatch(/past/);
  });
  it('formats today as YYYY-MM-DD', () => expect(todayISO(new Date(2026, 9, 10))).toBe('2026-10-10'));
});
