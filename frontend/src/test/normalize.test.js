import { describe, expect, it } from 'vitest';
import { countLevels, filterSources, normalizeSource, normalizeSourceDetail, normalizeSourceList, rankSources } from '../lib/normalize.js';
import { apiDetail, apiListItems as apiList, apiListResponse } from './fixtures.js';

describe('normalizeSourceList', () => {
  it('accepts a bare array and common wrappers', () => {
    expect(normalizeSourceList(apiList).items).toHaveLength(3);
    expect(normalizeSourceList({ items: apiList }).items).toHaveLength(3);
    expect(normalizeSourceList(apiListResponse).items).toHaveLength(3); // { count, sources }
    expect(normalizeSourceList({ sources: apiList }).items).toHaveLength(3);
  });
  it('skips malformed and duplicate records and counts them', () => {
    const { items, skipped } = normalizeSourceList([apiList[0], null, { village: 'no id' }, apiList[0]]);
    expect(items).toHaveLength(1);
    expect(skipped).toBe(3);
  });
  it('throws on an unexpected shape or when nothing is usable', () => {
    expect(() => normalizeSourceList({ hello: 1 })).toThrow(/expected format/);
    expect(() => normalizeSourceList([{ x: 1 }])).toThrow(/usable source_id/);
  });
  it('accepts an empty list', () => {
    expect(normalizeSourceList([]).items).toEqual([]);
  });
});

describe('normalizeSource', () => {
  it('keeps missing values as null and never derives a level from a score', () => {
    const s = normalizeSource({ source_id: 'A', score: 0.9 });
    expect(s.level).toBeNull();
    expect(s.score).toBe(0.9);
    expect(s.village).toBeNull();
    expect(s.pumpDepthM).toBeNull();
  });
  it('keeps a genuine zero distinct from missing', () => {
    expect(normalizeSource({ source_id: 'A', score: 0, households: 0 })).toMatchObject({ score: 0, households: 0 });
  });
  it('normalises level case and rejects unknown labels', () => {
    expect(normalizeSource({ source_id: 'A', level: 'high' }).level).toBe('High');
    expect(normalizeSource({ source_id: 'A', level: 'critical' }).level).toBeNull();
  });
  it('drops invalid coordinates', () => {
    expect(normalizeSource({ source_id: 'A', lat: 'abc', lon: 80 }).lat).toBeNull();
    expect(normalizeSource({ source_id: 'A', lat: 95, lon: 80 }).lon).toBeNull();
  });
  it('reads score, level and reasons from the nested priority object', () => {
    const s = normalizeSource({ source_id: 'A', priority: { score: 0.5, level: 'medium', reasons: ['r'] } });
    expect(s).toMatchObject({ score: 0.5, level: 'Medium', reasons: ['r'] });
  });
  it('picks up translated reasons when the backend sends them', () => {
    const s = normalizeSource({ source_id: 'A', reasons: ['x'], reasons_hi: ['y'] });
    expect(s.reasonsLocal).toEqual(['y']);
    expect(s.localLang).toBe('hi');
  });
});

describe('normalizeSourceDetail', () => {
  it('reads factors, trend and reports', () => {
    const d = normalizeSourceDetail(apiDetail);
    expect(d.factors[0]).toMatchObject({ label: 'groundwater_trend', weight: 0.25, contribution: 0.2 });
    expect(d.dataCompleteness).toBe('partial');
    expect(d.trend).toMatchObject({ slope: 0.248871, significant: true, nearestStationKm: 2.899, measurementStatus: 'unverified' });
    expect(d.reports[0]).toMatchObject({ date: '2026-10-01', yieldLevel: 'low', failure: false });
  });
  it('supports factors given as an object and a nested source', () => {
    const d = normalizeSourceDetail({ source: { source_id: 'A' }, factors: { depth_margin: 0.1 } });
    expect(d.id).toBe('A');
    expect(d.factors).toEqual([{ label: 'depth_margin', value: null, weight: null, contribution: 0.1 }]);
  });
  it('rejects a detail without an id', () => {
    expect(() => normalizeSourceDetail({})).toThrow();
    expect(() => normalizeSourceDetail([])).toThrow();
  });
});

describe('ranking and filtering', () => {
  const items = normalizeSourceList(apiList).items;
  it('ranks by score descending with unscored sources last', () => {
    const withNone = [...items, normalizeSource({ source_id: 'Z' })];
    expect(rankSources(withNone).map((s) => s.id)).toEqual(['DEMO-SRC-002', 'DEMO-SRC-001', 'DEMO-SRC-003', 'Z']);
  });
  it('filters by level, district and text', () => {
    expect(filterSources(items, { level: 'High' }).map((s) => s.id)).toEqual(['DEMO-SRC-002']);
    expect(filterSources(items, { district: 'BHOJPUR' })).toHaveLength(1);
    expect(filterSources(items, { query: 'village 01' })).toHaveLength(1);
    expect(filterSources(items, { level: 'Unscored' })).toHaveLength(0);
  });
  it('counts levels', () => {
    expect(countLevels(items)).toEqual({ High: 1, Medium: 1, Low: 1, Unscored: 0 });
  });
});
