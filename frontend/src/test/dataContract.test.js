import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  countLevels,
  filterSources,
  normalizeSource,
  normalizeSourceDetail,
  normalizeSourceList,
  rankSources,
} from '../lib/normalize.js';

function parseCSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8').trim();
  const [headerLine, ...lines] = content.split(/\r?\n/).filter((l) => l.trim());
  const headers = headerLine.split(',').map((h) => h.trim());
  return lines.map((line) => {
    const values = line.split(',').map((v) => v.trim());
    return headers.reduce((obj, h, i) => {
      let val = values[i];
      if (val === 'true') val = true;
      else if (val === 'false') val = false;
      else if (val !== '' && !Number.isNaN(Number(val)) && !['source_id', 'nearest_station_id'].includes(h)) {
        val = Number(val);
      }
      obj[h] = val;
      return obj;
    }, {});
  });
}

describe('CSV seed and trend data contracts', () => {
  const seedPath = path.resolve(__dirname, '../../../data/sources_seed.csv');
  const trendsPath = path.resolve(__dirname, '../../../data/source_trends.csv');

  it('reads exactly 24 seed sources and 24 trend records', () => {
    expect(fs.existsSync(seedPath)).toBe(true);
    expect(fs.existsSync(trendsPath)).toBe(true);

    const seedRecords = parseCSV(seedPath);
    const trendRecords = parseCSV(trendsPath);

    expect(seedRecords).toHaveLength(24);
    expect(trendRecords).toHaveLength(24);
  });

  it('verifies every seed source has valid structure, coordinates in Bihar, and synthetic flag', () => {
    const seedRecords = parseCSV(seedPath);
    const normalized = seedRecords.map(normalizeSource);

    expect(normalized).toHaveLength(24);
    normalized.forEach((s, idx) => {
      expect(s.id).toBe(`DEMO-SRC-${String(idx + 1).padStart(3, '0')}`);
      expect(s.village).toBeTruthy();
      expect(s.district).toBeTruthy();
      expect(s.synthetic).toBe(true);
      // Coordinates should be in Bihar region
      expect(s.lat).toBeGreaterThan(24.0);
      expect(s.lat).toBeLessThan(27.5);
      expect(s.lon).toBeGreaterThan(83.0);
      expect(s.lon).toBeLessThan(88.5);
      // Priority score must remain null (not fabricated from CSV)
      expect(s.score).toBeNull();
      expect(s.level).toBeNull();
    });
  });

  it('verifies 1-to-1 matching between seed records and groundwater trend records', () => {
    const seedRecords = parseCSV(seedPath);
    const trendRecords = parseCSV(trendsPath);

    const seedIds = new Set(seedRecords.map((r) => r.source_id));
    const trendIds = new Set(trendRecords.map((r) => r.source_id));

    expect(seedIds.size).toBe(24);
    expect(trendIds.size).toBe(24);
    seedRecords.forEach((s) => {
      expect(trendIds.has(s.source_id)).toBe(true);
    });
  });

  it('normalizes merged source details without inventing missing scores', () => {
    const seedRecords = parseCSV(seedPath);
    const trendRecords = parseCSV(trendsPath);
    const trendMap = new Map(trendRecords.map((t) => [t.source_id, t]));

    seedRecords.forEach((seed) => {
      const trend = trendMap.get(seed.source_id);
      const merged = { ...seed, ...trend };
      const detail = normalizeSourceDetail(merged);

      expect(detail.id).toBe(seed.source_id);
      expect(detail.village).toBe(seed.village);
      expect(detail.district).toBe(seed.district);
      expect(detail.synthetic).toBe(true);
      expect(detail.score).toBeNull();
      expect(detail.level).toBeNull();

      expect(detail.trend.slope).toBe(trend.weighted_slope);
      expect(detail.trend.significant).toBe(trend.significance);
      expect(detail.trend.nearestStationKm).toBe(trend.nearest_station_km);
      expect(detail.trend.measurementStatus).toBe('unverified');
    });
  });

  it('verifies list normalization handles the 24 wrapped seed records cleanly', () => {
    const seedRecords = parseCSV(seedPath);
    const response = { count: 24, sources: seedRecords };
    const { items, skipped } = normalizeSourceList(response);

    expect(items).toHaveLength(24);
    expect(skipped).toBe(0);

    const counts = countLevels(items);
    expect(counts).toEqual({ High: 0, Medium: 0, Low: 0, Unscored: 24 });

    const filtered = filterSources(items, { district: 'PATNA' });
    expect(filtered.length).toBe(2);
    expect(filtered.map((s) => s.id)).toEqual(['DEMO-SRC-016', 'DEMO-SRC-024']);
  });
});
