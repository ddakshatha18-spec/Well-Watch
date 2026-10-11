export const YIELD_LEVELS = [
  { value: 'normal', label: 'Normal flow' },
  { value: 'low', label: 'Low flow' },
  { value: 'none', label: 'No water' },
];

export function todayISO(now = new Date()) {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function isRealDate(s) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const [y, m, d] = s.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}

// Returns an object of field -> message. Empty object means valid.
export function validateReport(values, { knownIds, today = todayISO() }) {
  const errors = {};
  if (!values.sourceId) errors.sourceId = 'Choose the water source you inspected.';
  else if (values.sourceId.length > 64 || !knownIds.includes(values.sourceId)) errors.sourceId = 'Choose a source from the list.';

  if (!YIELD_LEVELS.some((y) => y.value === values.yieldLevel)) errors.yieldLevel = 'Select how much water the source gives.';

  if (!values.date) errors.date = 'Enter the date of the observation.';
  else if (!isRealDate(values.date)) errors.date = 'Enter a real date.';
  else if (values.date > today) errors.date = 'The date cannot be in the future.';
  else if (values.date < '2000-01-01') errors.date = 'That date is too far in the past.';

  return errors;
}
