import { API_BASE_URL, REQUEST_TIMEOUT_MS } from '../config.js';
import { ApiError } from './errors.js';
import {
  normalizeReportResult,
  normalizeSourceDetail,
  normalizeSourceList,
} from '../lib/normalize.js';

export { ApiError };

function serverMessage(body) {
  if (!body || typeof body !== 'object') return null;
  const m = body.message ?? body.error ?? body.detail;
  if (typeof m === 'string') return m;
  if (Array.isArray(body.errors)) return body.errors.map(String).join('; ');
  return null;
}

async function request(path, { method = 'GET', body, token, signal, baseUrl = API_BASE_URL } = {}) {
  const headers = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, REQUEST_TIMEOUT_MS);
  if (signal) {
    if (signal.aborted) controller.abort();
    else signal.addEventListener('abort', () => controller.abort(), { once: true });
  }

  let res;
  try {
    res = await fetch(`${baseUrl}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch (err) {
    if (timedOut) throw new ApiError('timeout', 'The server took too long to respond.');
    if (err?.name === 'AbortError') throw err; // caller cancelled on purpose
    throw new ApiError('network', 'Could not reach the server.');
  } finally {
    clearTimeout(timer);
  }

  const text = await res.text();
  let json = null;
  let parsed = true;
  if (text.trim() !== '') {
    try {
      json = JSON.parse(text);
    } catch {
      parsed = false;
    }
  }
  const msg = parsed ? serverMessage(json) : null;

  if (!res.ok) {
    const status = res.status;
    if (status === 401) throw new ApiError('unauthorized', msg || 'A valid access token is required.', { status, details: json });
    if (status === 403) throw new ApiError('forbidden', msg || 'This token or site is not allowed to do that.', { status, details: json });
    if (status === 404) throw new ApiError('not_found', msg || 'Not found.', { status, details: json });
    if (status === 400 || status === 422) throw new ApiError('validation', msg || 'The server rejected the submitted values.', { status, details: json });
    if (status >= 500) throw new ApiError('server', msg || 'The server had a problem.', { status, details: json });
    throw new ApiError('http', msg || `Unexpected response (${status}).`, { status, details: json });
  }
  if (!parsed) throw new ApiError('invalid_response', 'The server replied with something that was not valid JSON.', { status: res.status });
  return json;
}

export async function getSources(opts) {
  return normalizeSourceList(await request('/sources', opts));
}

export async function getSource(id, opts) {
  return normalizeSourceDetail(await request(`/sources/${encodeURIComponent(id)}`, opts));
}

// Payload follows the data contract (section 9.3 of the plan).
export function buildReportPayload({ sourceId, yieldLevel, failureFlag, date }) {
  return { source_id: sourceId, yield_level: yieldLevel, failure_flag: Boolean(failureFlag), date };
}

export async function postReport(values, opts = {}) {
  const json = await request('/reports', { ...opts, method: 'POST', body: buildReportPayload(values) });
  return normalizeReportResult(json);
}
