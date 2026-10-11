export const dash = '—';
export const fmtNum = (n, digits = 2) => (n === null || n === undefined ? dash : n.toFixed(digits));
export const fmtInt = (n) => (n === null || n === undefined ? dash : Math.round(n).toLocaleString('en-IN'));
export const fmtBool = (b) => (b === null || b === undefined ? dash : b ? 'Yes' : 'No');
export const titleCase = (s) => (s ? s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : dash);
export const districtName = (s) => (s ? s.charAt(0) + s.slice(1).toLowerCase() : dash);
