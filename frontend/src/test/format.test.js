import { describe, expect, it } from 'vitest';
import { formatSourceName, fmtSourceName } from '../lib/format.js';
import { buildPlanCsv, buildSourceCsv } from '../lib/export.js';

describe('formatSourceName display formatting', () => {
  it('formats Demo Village 01 to Sample Source 01', () => {
    expect(formatSourceName('Demo Village 01')).toBe('Sample Source 01');
    expect(formatSourceName('Demo Village 02')).toBe('Sample Source 02');
    expect(formatSourceName('Demo Village 24')).toBe('Sample Source 24');
  });

  it('formats source objects with village or fallback id', () => {
    expect(formatSourceName({ village: 'Demo Village 01', id: 'DEMO-SRC-001' })).toBe('Sample Source 01');
    expect(formatSourceName({ village: null, id: 'DEMO-SRC-001' })).toBe('DEMO-SRC-001');
  });

  it('preserves real source names and handles empty/null gracefully', () => {
    expect(formatSourceName('Phulwari Sharif')).toBe('Phulwari Sharif');
    expect(formatSourceName(null)).toBe('—');
    expect(formatSourceName(undefined)).toBe('—');
  });

  it('fmtSourceName is an alias of formatSourceName', () => {
    expect(fmtSourceName('Demo Village 05')).toBe('Sample Source 05');
  });
});

describe('buildPlanCsv weekly plan export', () => {
  it('exports Source ID, Display Name, District, Priority Score, Priority Level, Priority Reasons, Synthetic Status', () => {
    const mockSources = [
      {
        id: 'DEMO-SRC-002',
        village: 'Demo Village 02',
        district: 'ARARIA',
        synthetic: true,
        score: 0.82,
        level: 'High',
        reasons: ['Nearby groundwater falling steadily', '2 low-yield reports this month'],
      },
      {
        id: 'DEMO-SRC-001',
        village: 'Demo Village 01',
        district: 'AURANGABAD',
        synthetic: true,
        score: 0.41,
        level: 'Medium',
        reasons: ['Nearby groundwater falling slowly'],
      },
    ];

    const csv = buildPlanCsv(mockSources);
    expect(csv).toContain('Source ID,Display Name,District,Priority Score,Priority Level,Priority Reasons,Synthetic Status');
    expect(csv).toContain('DEMO-SRC-002,Sample Source 02,Araria,0.82,High,Nearby groundwater falling steadily; 2 low-yield reports this month,Synthetic');
    expect(csv).toContain('DEMO-SRC-001,Sample Source 01,Aurangabad,0.41,Medium,Nearby groundwater falling slowly,Synthetic');
  });
});

describe('buildSourceCsv queue export', () => {
  it('preserves original source ID, applies formatSourceName display name, and includes synthetic flag', () => {
    const mockSources = [
      {
        id: 'DEMO-SRC-001',
        village: 'Demo Village 01',
        district: 'AURANGABAD',
        sourceType: 'hand_pump',
        synthetic: true,
        score: 0.41,
        level: 'Medium',
        lat: 24.882,
        lon: 84.224,
        reasons: ['Nearby groundwater falling slowly'],
      },
    ];

    const csv = buildSourceCsv(mockSources);
    expect(csv).toContain('source_id,display_name,district,source_type,priority_level,priority_score,synthetic,latitude,longitude,key_reason');
    expect(csv).toContain('DEMO-SRC-001,Sample Source 01,Aurangabad,hand_pump,Medium,0.41,true,24.882,84.224,Nearby groundwater falling slowly');
  });
});
