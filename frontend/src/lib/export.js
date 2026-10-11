import { districtName, formatSourceName } from './format.js';

/**
 * Builds CSV string from source records.
 * Ensures display name change is applied, original source_id is preserved,
 * and synthetic flag is included.
 */
export function buildSourceCsv(items) {
  const headers = [
    'source_id',
    'display_name',
    'district',
    'source_type',
    'priority_level',
    'priority_score',
    'synthetic',
    'latitude',
    'longitude',
    'key_reason',
  ];

  const rows = items.map((s) => {
    const originalId = s.id ?? '';
    const displayName = formatSourceName(s.village ?? s.id);
    const district = s.district ? districtName(s.district) : '';
    const sourceType = s.sourceType ?? '';
    const level = s.level ?? 'Unscored';
    const score = s.score !== null && s.score !== undefined ? s.score : '';
    const isSynthetic = s.synthetic ? 'true' : 'false';
    const lat = s.lat !== null && s.lat !== undefined ? s.lat : '';
    const lon = s.lon !== null && s.lon !== undefined ? s.lon : '';
    const reason = s.reasons?.[0] ?? '';

    return [
      originalId,
      displayName,
      district,
      sourceType,
      level,
      score,
      isSynthetic,
      lat,
      lon,
      reason,
    ]
      .map((val) => {
        const strVal = String(val ?? '');
        return strVal.includes(',') || strVal.includes('"') || strVal.includes('\n')
          ? `"${strVal.replace(/"/g, '""')}"`
          : strVal;
      })
      .join(',');
  });

  return [headers.join(','), ...rows].join('\r\n');
}

/**
 * Triggers a browser download of the inspection queue as CSV.
 */
export function exportSourcesToCsv(items, filename = 'wellwatch_inspection_queue.csv') {
  if (typeof document === 'undefined') return;
  const csvContent = buildSourceCsv(items);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
