export const dash = '—';
export const fmtNum = (n, digits = 2) => (n === null || n === undefined ? dash : n.toFixed(digits));
export const fmtInt = (n) => (n === null || n === undefined ? dash : Math.round(n).toLocaleString('en-IN'));
export const fmtBool = (b) => (b === null || b === undefined ? dash : b ? 'Yes' : 'No');
export const titleCase = (s) => (s ? s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : dash);
export const districtName = (s) => (s ? s.charAt(0) + s.slice(1).toLowerCase() : dash);

/**
 * Presentation-only display name formatter for water sources.
 * Formats "Demo Village 01" to "Sample Source 01", etc.
 * Preserves the underlying source ID and leaves real names unchanged.
 */
export const formatSourceName = (sourceOrName) => {
  if (!sourceOrName) return dash;
  const name =
    typeof sourceOrName === 'object'
      ? (sourceOrName.village || sourceOrName.id || dash)
      : sourceOrName;
  if (!name || name === dash) return dash;
  return String(name).replace(/\bDemo\s+/gi, '').trim();
};

export const fmtSourceName = formatSourceName;
