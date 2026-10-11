// Turns whatever the API returns into predictable shapes for the UI.
// Rules: never invent values, never derive a risk level, keep "missing" as null.
import { ApiError } from '../api/errors.js';

export const LEVELS = ['High', 'Medium', 'Low'];

export function num(v) {
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;
  if (typeof v === 'string' && v.trim() !== '') {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

export function bool(v) {
  if (typeof v === 'boolean') return v;
  if (typeof v === 'string') {
    const s = v.trim().toLowerCase();
    if (s === 'true') return true;
    if (s === 'false') return false;
  }
  return null;
}

export function str(v) {
  return typeof v === 'string' && v.trim() !== '' ? v.trim() : null;
}

export function normalizeLevel(v) {
  if (typeof v !== 'string') return null;
  const s = v.trim().toLowerCase();
  return LEVELS.find((l) => l.toLowerCase() === s) ?? null;
}

function strList(v) {
  if (Array.isArray(v)) return v.filter((x) => typeof x === 'string' && x.trim()).map((x) => x.trim());
  if (typeof v === 'string' && v.trim()) return [v.trim()];
  return [];
}

function validCoord(lat, lon) {
  return lat !== null && lon !== null && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
}

const LOCAL_FIELDS = [
  ['reasons_hi', 'hi'],
  ['reasons_te', 'te'],
  ['reasons_hi_or_te', 'local'],
];

const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);

// Backend nests scoring output under `priority`; older/flat shapes are still accepted.
// First defined value wins, searching each object in order.
function pick(objs, keys) {
  for (const o of objs) {
    if (!isObj(o)) continue;
    for (const k of keys) if (o[k] !== undefined && o[k] !== null) return o[k];
  }
  return undefined;
}

export function normalizeSource(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const pr = isObj(raw.priority) ? raw.priority : {};
  const scope = [pr, raw];
  const id = str(raw.source_id) ?? (typeof raw.source_id === 'number' ? String(raw.source_id) : null);
  if (!id) return null;

  const lat = num(raw.lat);
  const lon = num(raw.lon);
  let reasonsLocal = [];
  let localLang = null;
  for (const [field, lang] of LOCAL_FIELDS) {
    const list = strList(pick(scope, [field]));
    if (list.length) {
      reasonsLocal = list;
      localLang = lang;
      break;
    }
  }

  return {
    id,
    village: str(raw.village),
    district: str(raw.district),
    lat: validCoord(lat, lon) ? lat : null,
    lon: validCoord(lat, lon) ? lon : null,
    score: num(pick(scope, ['score'])),
    level: normalizeLevel(pick(scope, ['level'])),
    reasons: strList(pick(scope, ['reasons', 'reasons_en', 'top_reasons'])),
    reasonsLocal,
    localLang,
    synthetic: bool(raw.synthetic),
    sourceType: str(raw.source_type),
    pumpDepthM: num(pick([raw, pr], ['pump_depth_m'])),
    households: num(raw.households),
    installedYear: num(raw.installed_year),
  };
}

export function unwrapList(json) {
  if (Array.isArray(json)) return json;
  if (json && typeof json === 'object') {
    for (const key of ['sources', 'items', 'data', 'results', 'Items']) {
      if (Array.isArray(json[key])) return json[key];
    }
  }
  throw new ApiError('invalid_response', 'The server replied, but the source list was not in the expected format.');
}

export function normalizeSourceList(json) {
  const rawItems = unwrapList(json);
  const items = [];
  let skipped = 0;
  const seen = new Set();
  for (const raw of rawItems) {
    const s = normalizeSource(raw);
    if (!s || seen.has(s.id)) {
      skipped += 1;
      continue;
    }
    seen.add(s.id);
    items.push(s);
  }
  if (rawItems.length > 0 && items.length === 0) {
    throw new ApiError('invalid_response', 'The server replied, but none of the records had a usable source_id.');
  }
  return { items, skipped };
}

function normalizeFactors(raw) {
  if (!raw) return [];
  const toFactor = (key, f) => {
    if (f && typeof f === 'object') {
      return {
        label: str(f.label) ?? str(f.name) ?? str(f.factor) ?? key,
        value: num(f.value ?? f.normalized ?? f.normalised),
        weight: num(f.weight),
        contribution: num(f.contribution ?? f.weighted_contribution ?? f.weighted),
      };
    }
    return { label: key, value: null, weight: null, contribution: num(f) };
  };
  const list = Array.isArray(raw)
    ? raw.map((f, i) => toFactor(String(i + 1), f))
    : typeof raw === 'object'
      ? Object.entries(raw).map(([k, f]) => toFactor(k, f))
      : [];
  return list.filter((f) => f.label && (f.value !== null || f.contribution !== null));
}

// data_completeness shape is not documented: keep a number, a string, or a flat object of simple values.
function normalizeCompleteness(v) {
  if (typeof v === 'number' && Number.isFinite(v)) return String(v);
  if (typeof v === 'string' && v.trim()) return v.trim();
  if (isObj(v)) {
    const parts = Object.entries(v)
      .filter(([, x]) => ['string', 'number', 'boolean'].includes(typeof x))
      .map(([k, x]) => `${k.replace(/_/g, ' ')}: ${x}`);
    return parts.length ? parts.join(', ') : null;
  }
  return null;
}

function normalizeReports(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((r) => r && typeof r === 'object')
    .map((r) => ({
      date: str(r.report_date) ?? str(r.date),
      yieldLevel: str(r.yield_level),
      failure: bool(r.failure_flag),
      synthetic: bool(r.synthetic),
    }));
}

export function normalizeSourceDetail(json) {
  if (!json || typeof json !== 'object' || Array.isArray(json)) {
    throw new ApiError('invalid_response', 'The server replied, but the source detail was not in the expected format.');
  }
  const base = json.source && typeof json.source === 'object' ? { ...json, ...json.source } : json;
  const source = normalizeSource(base);
  if (!source) {
    throw new ApiError('invalid_response', 'The server replied, but the source detail had no source_id.');
  }
  const pr = isObj(base.priority) ? base.priority : {};
  const scope = [base.trend, pr, base.groundwater, base];
  return {
    ...source,
    factors: normalizeFactors(pick([pr, base], ['factors', 'contributions'])),
    dataCompleteness: normalizeCompleteness(pick([pr, base], ['data_completeness'])),
    reports: normalizeReports(base.recent_reports ?? base.reports),
    trend: {
      slope: num(pick(scope, ['weighted_slope', 'trend_value', 'slope'])),
      significant: bool(pick(scope, ['significance'])),
      nearestStationKm: num(pick(scope, ['nearest_station_km'])),
      nearestStationId: str(pick(scope, ['nearest_station_id', 'station_id'])),
      measurementStatus: str(pick(scope, ['measurement_status'])),
      matchingMethod: str(pick(scope, ['matching_method'])),
    },
    updatedAt: str(pick([pr, base], ['updated_at'])),
  };
}

export function normalizeReportResult(json) {
  if (json === null || json === undefined) return { score: null, level: null, reasons: [], message: null };
  const r = isObj(json) ? json : {};
  const scope = [r.priority, r.result, r.result?.priority, r];
  return {
    score: num(pick(scope, ['score', 'new_score'])),
    level: normalizeLevel(pick(scope, ['level', 'new_level'])),
    reasons: strList(pick(scope, ['reasons', 'reasons_en'])),
    message: str(r.message) ?? null,
  };
}

// Highest score first; sources without a score keep API order at the end.
export function rankSources(items) {
  return items
    .map((s, i) => ({ s, i }))
    .sort((a, b) => {
      if (a.s.score === null && b.s.score === null) return a.i - b.i;
      if (a.s.score === null) return 1;
      if (b.s.score === null) return -1;
      return b.s.score - a.s.score || a.i - b.i;
    })
    .map(({ s }) => s);
}

export function filterSources(items, { district, level, query, sourceType, sortBy } = {}) {
  const q = (query || '').trim().toLowerCase();
  const filtered = items.filter((s) => {
    if (district && s.district !== district) return false;
    if (level === 'Unscored' ? s.level !== null : level && s.level !== level) return false;
    if (sourceType && s.sourceType !== sourceType) return false;
    if (q && !`${s.village ?? ''} ${s.id} ${s.district ?? ''} ${s.sourceType ?? ''}`.toLowerCase().includes(q)) return false;
    return true;
  });

  if (!sortBy || sortBy === 'score_desc') {
    return rankSources(filtered);
  }

  return [...filtered].sort((a, b) => {
    if (sortBy === 'score_asc') {
      if (a.score === null && b.score === null) return 0;
      if (a.score === null) return 1;
      if (b.score === null) return -1;
      return a.score - b.score;
    }
    if (sortBy === 'village_asc') {
      return (a.village || a.id).localeCompare(b.village || b.id);
    }
    if (sortBy === 'district_asc') {
      return (a.district || '').localeCompare(b.district || '') || (a.village || a.id).localeCompare(b.village || b.id);
    }
    return 0;
  });
}

export function countLevels(items) {
  const counts = { High: 0, Medium: 0, Low: 0, Unscored: 0 };
  for (const s of items) counts[s.level ?? 'Unscored'] += 1;
  return counts;
}
