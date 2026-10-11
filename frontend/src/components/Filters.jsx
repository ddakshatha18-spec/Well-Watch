import { districtName } from '../lib/format.js';

export default function Filters({
  districts,
  filters,
  onChange,
  counts,
  shown,
  total,
  viewMode = 'card',
  onViewModeChange,
  onExportCsv,
}) {
  const set = (patch) => onChange({ ...filters, ...patch });
  const chips = [
    ['High', counts.High],
    ['Medium', counts.Medium],
    ['Low', counts.Low],
    ['Unscored', counts.Unscored],
  ].filter(([k, n]) => n > 0 || filters.level === k);

  const active = filters.district || filters.level || filters.query || filters.sourceType || (filters.sortBy && filters.sortBy !== 'score_desc');

  return (
    <section className="filters" aria-label="Filter sources">
      <div className="filters-header">
        <h3 className="filters-title">Filter Inspection Queue</h3>
        <div className="filters-actions">
          {onExportCsv && (
            <button
              type="button"
              className="export-btn"
              onClick={onExportCsv}
              title="Export inspection queue as CSV"
            >
              Export CSV
            </button>
          )}
          {onViewModeChange && (
            <div className="view-mode-toggle" role="group" aria-label="Layout view">
              <button
                type="button"
                className={`view-mode-btn ${viewMode === 'card' ? 'active' : ''}`}
                onClick={() => onViewModeChange('card')}
              >
                Cards
              </button>
              <button
                type="button"
                className={`view-mode-btn ${viewMode === 'table' ? 'active' : ''}`}
                onClick={() => onViewModeChange('table')}
              >
                Table
              </button>
            </div>
          )}
        </div>
      </div>

      {chips.length > 0 && (
        <div className="chips" role="group" aria-label="Filter by priority">
          {chips.map(([k, n]) => (
            <button
              key={k}
              type="button"
              className={`chip chip-${k.toLowerCase()}`}
              aria-pressed={filters.level === k}
              onClick={() => set({ level: filters.level === k ? '' : k })}
            >
              <span className="chip-n">{n}</span> {k === 'Unscored' ? 'Not scored' : k}
            </button>
          ))}
        </div>
      )}

      <div className="filter-row">
        <div className="field">
          <label htmlFor="f-search">Search</label>
          <input
            id="f-search"
            type="search"
            placeholder="Village or source ID"
            value={filters.query}
            onChange={(e) => set({ query: e.target.value })}
          />
        </div>

        <div className="field">
          <label htmlFor="f-district">District</label>
          <select id="f-district" value={filters.district} onChange={(e) => set({ district: e.target.value })}>
            <option value="">All districts</option>
            {districts.map((d) => (
              <option key={d} value={d}>
                {districtName(d)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="filter-row filter-row-secondary">
        <div className="field">
          <label htmlFor="f-sort">Sort by</label>
          <select
            id="f-sort"
            value={filters.sortBy || 'score_desc'}
            onChange={(e) => set({ sortBy: e.target.value })}
          >
            <option value="score_desc">Priority Score (Highest first)</option>
            <option value="score_asc">Priority Score (Lowest first)</option>
            <option value="village_asc">Village Name (A–Z)</option>
            <option value="district_asc">District (A–Z)</option>
          </select>
        </div>

        <div className="field">
          <label htmlFor="f-source-type">Source Type</label>
          <select
            id="f-source-type"
            value={filters.sourceType || ''}
            onChange={(e) => set({ sourceType: e.target.value })}
          >
            <option value="">All source types</option>
            <option value="hand_pump">Hand Pump</option>
            <option value="borewell">Borewell</option>
            <option value="public_tap">Public Tap</option>
          </select>
        </div>
      </div>

      <div className="filter-meta" aria-live="polite">
        <span>Showing {shown} of {total} sources</span>
        {active && (
          <button
            type="button"
            className="link"
            onClick={() => onChange({ district: '', level: '', query: '', sourceType: '', sortBy: 'score_desc' })}
          >
            Clear filters
          </button>
        )}
      </div>
    </section>
  );
}
