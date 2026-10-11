import { describe, expect, it } from 'vitest';
import { formatSourceName, fmtSourceName } from '../lib/format.js';
import { buildSourceCsv } from '../lib/export.js';

describe('formatSourceName display formatting', () => {
  it('removes Demo prefix so Demo Village 01 becomes Village 01', () => {
    expect(formatSourceName('Demo Village 01')).toBe('Village 01');
    expect(formatSourceName('Demo Village 02')).toBe('Village 02');
    expect(formatSourceName('Demo Village 24')).toBe('Village 24');
  });

  it('formats source objects with village or fallback id', () => {
    expect(formatSourceName({ village: 'Demo Village 01', id: 'DEMO-SRC-001' })).toBe('Village 01');
    expect(formatSourceName({ village: null, id: 'DEMO-SRC-001' })).toBe('DEMO-SRC-001');
  });

  it('preserves real source names and handles empty/null gracefully', () => {
    expect(formatSourceName('Phulwari Sharif')).toBe('Phulwari Sharif');
    expect(formatSourceName(null)).toBe('—');
    expect(formatSourceName(undefined)).toBe('—');
  });

  it('fmtSourceName is an alias of formatSourceName', () => {
    expect(fmtSourceName('Demo Village 05')).toBe('Village 05');
  });
});

describe('buildSourceCsv inspection export', () => {
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
    expect(csv).toContain('DEMO-SRC-001,Village 01,Aurangabad,hand_pump,Medium,0.41,true,24.882,84.224,Nearby groundwater falling slowly');
  });
});
