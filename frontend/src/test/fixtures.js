// TEST FIXTURES ONLY. Shape follows the real API as described by Person 3:
// { count, sources: [{ source_id, village, district, lat, lon, synthetic, priority: { score, level, reasons, factors, data_completeness } }] }. Source ids, villages, districts and coordinates come from sources_seed.csv.
// The scores, levels and reasons below are made up for the tests (the CSVs contain no scores).
export const apiListItems = [
  { source_id: 'DEMO-SRC-001', village: 'Demo Village 01', district: 'AURANGABAD', lat: 24.882, lon: 84.224, source_type: 'hand_pump', synthetic: true, priority: { score: 0.41, level: 'Medium', reasons: ['Nearby groundwater falling slowly'] } },
  { source_id: 'DEMO-SRC-002', village: 'Demo Village 02', district: 'ARARIA', lat: 26.062, lon: 87.251, source_type: 'borewell', synthetic: true, priority: { score: 0.82, level: 'High', reasons: ['Nearby groundwater falling steadily', '2 low-yield reports this month'] } },
  { source_id: 'DEMO-SRC-003', village: 'Demo Village 03', district: 'BHOJPUR', lat: 25.424, lon: 84.532, source_type: 'public_tap', synthetic: true, priority: { score: 0.12, level: 'Low', reasons: ['No recent reports'] } },
];

export const apiDetail = {
  ...apiListItems[1],
  priority: {
    ...apiListItems[1].priority,
    factors: [
      { name: 'groundwater_trend', weight: 0.25, contribution: 0.2 },
      { name: 'low_yield_reports', weight: 0.2, contribution: 0.1 },
    ],
    data_completeness: 'partial',
  },
  pump_depth_m: 38.5,
  households: 120,
  weighted_slope: 0.248871,
  significance: true,
  nearest_station_km: 2.899,
  measurement_status: 'unverified',
  recent_reports: [{ report_date: '2026-10-01', yield_level: 'low', failure_flag: false, synthetic: true }],
};

export function jsonResponse(body, status = 200) {
  return Promise.resolve(new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } }));
}

export const apiList = apiListItems;
export const apiListResponse = { count: apiListItems.length, sources: apiListItems };
