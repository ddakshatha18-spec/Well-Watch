import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError, getSource, getSources, postReport } from '../api/client.js';
import { apiDetail, apiListResponse as apiList, jsonResponse } from './fixtures.js';

beforeEach(() => vi.stubGlobal('fetch', vi.fn()));
afterEach(() => vi.unstubAllGlobals());

describe('api client', () => {
  it('loads and normalises the list from the configured base URL', async () => {
    fetch.mockReturnValueOnce(jsonResponse(apiList));
    const { items } = await getSources();
    expect(items).toHaveLength(3);
    expect(items.find((s) => s.id === 'DEMO-SRC-002')).toMatchObject({ score: 0.82, level: 'High' });
    expect(fetch.mock.calls[0][0]).toBe('https://e95a0mqwd6.execute-api.ap-south-1.amazonaws.com/Prod/sources');
    expect(fetch.mock.calls[0][1].headers.Authorization).toBeUndefined();
  });
  it('URL-encodes ids and sends the Bearer token only when given', async () => {
    fetch.mockReturnValueOnce(jsonResponse(apiDetail));
    await getSource('A B/1', { token: 'abc' });
    expect(fetch.mock.calls[0][0]).toMatch(/\/sources\/A%20B%2F1$/);
    expect(fetch.mock.calls[0][1].headers.Authorization).toBe('Bearer abc');
  });
  it.each([
    [401, 'unauthorized'],
    [403, 'forbidden'],
    [404, 'not_found'],
    [422, 'validation'],
    [500, 'server'],
    [418, 'http'],
  ])('maps HTTP %i to %s', async (status, kind) => {
    fetch.mockReturnValueOnce(jsonResponse({ message: 'nope' }, status));
    await expect(getSources()).rejects.toMatchObject({ kind, status });
  });
  it('maps network failures and invalid JSON', async () => {
    fetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));
    await expect(getSources()).rejects.toMatchObject({ kind: 'network' });
    fetch.mockReturnValueOnce(Promise.resolve(new Response('<html>', { status: 200 })));
    await expect(getSources()).rejects.toBeInstanceOf(ApiError);
  });
  it('posts the contract payload', async () => {
    fetch.mockReturnValueOnce(jsonResponse({ priority: { score: 0.9, level: 'High' } }, 201));
    const r = await postReport({ sourceId: 'DEMO-SRC-001', yieldLevel: 'low', failureFlag: false, date: '2026-10-10' }, { token: 't' });
    const [url, init] = fetch.mock.calls[0];
    expect(url).toMatch(/\/reports$/);
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body)).toEqual({ source_id: 'DEMO-SRC-001', yield_level: 'low', failure_flag: false, date: '2026-10-10' });
    expect(r).toMatchObject({ score: 0.9, level: 'High' });
  });
});
