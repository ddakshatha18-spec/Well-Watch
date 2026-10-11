import { describe, expect, it } from 'vitest';
import { API_BASE_URL } from '../config.js';
import { buildReportPayload, getSource, getSources } from '../api/client.js';
import { normalizeSourceDetail, normalizeSourceList } from '../lib/normalize.js';
import { apiDetail, apiListResponse } from './fixtures.js';

describe('E2E live API readiness contract', () => {
  it('confirms the configured API base URL points to the Prod API Gateway stage', () => {
    expect(API_BASE_URL).toBe('https://e95a0mqwd6.execute-api.ap-south-1.amazonaws.com/Prod');
  });

  it('validates public GET response structure against the normalizer', () => {
    const parsed = normalizeSourceList(apiListResponse);
    expect(parsed.items).toHaveLength(3);
    expect(parsed.skipped).toBe(0);

    const first = parsed.items[0];
    expect(first).toMatchObject({
      id: 'DEMO-SRC-001',
      village: 'Demo Village 01',
      district: 'AURANGABAD',
      synthetic: true,
      score: 0.41,
      level: 'Medium',
    });
  });

  it('validates detailed source structure against trend and factor schemas', () => {
    const detail = normalizeSourceDetail(apiDetail);
    expect(detail.id).toBe('DEMO-SRC-002');
    expect(detail.synthetic).toBe(true);
    expect(detail.trend).toMatchObject({
      slope: 0.248871,
      significant: true,
      nearestStationKm: 2.899,
      measurementStatus: 'unverified',
    });
    expect(detail.factors).toHaveLength(2);
  });

  it('builds protected POST /reports payload adhering strictly to data contract', () => {
    const payload = buildReportPayload({
      sourceId: 'DEMO-SRC-001',
      yieldLevel: 'low',
      failureFlag: false,
      date: '2026-10-10',
    });

    expect(payload).toEqual({
      source_id: 'DEMO-SRC-001',
      yield_level: 'low',
      failure_flag: false,
      date: '2026-10-10',
    });
  });
});
