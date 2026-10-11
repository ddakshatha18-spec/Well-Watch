import { useMemo, useState } from 'react';
import LevelBadge from './LevelBadge.jsx';
import { districtName, formatSourceName } from '../lib/format.js';
import { exportPlanToCsv } from '../lib/export.js';

export default function InspectionPlanner({ items, onSelect, selectedId }) {
  const [capacity, setCapacity] = useState(5);

  // Exclude sources without valid scores and sort by highest score first, using source ID to break ties
  const scoredSources = useMemo(() => {
    return items
      .filter((s) => s.score !== null && s.score !== undefined && !Number.isNaN(s.score))
      .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
  }, [items]);

  const cap = Math.max(1, Number(capacity) || 1);
  const planned = useMemo(() => scoredSources.slice(0, cap), [scoredSources, cap]);

  if (!scoredSources.length) return null;

  return (
    <section className="inspection-planner" aria-label="Inspection Planner">
      <div className="planner-header">
        <div className="planner-title-wrap">
          <h3 className="planner-title">Plan This Week's Inspections</h3>
          <p className="planner-subtitle">
            Allocates top {planned.length} sources by priority score (tie-broken by source ID)
          </p>
        </div>
        <div className="planner-controls">
          <label htmlFor="planner-capacity" className="planner-capacity-label">
            Capacity:
            <input
              id="planner-capacity"
              type="number"
              min="1"
              max={scoredSources.length}
              value={capacity}
              onChange={(e) => setCapacity(Math.max(1, parseInt(e.target.value, 10) || 1))}
              className="planner-input"
            />
          </label>
          <button
            type="button"
            className="export-btn export-plan-btn"
            onClick={() => exportPlanToCsv(planned)}
          >
            Export Plan CSV
          </button>
        </div>
      </div>

      <div className="planner-list" role="group" aria-label="Planned sources">
        {planned.map((s, idx) => {
          const displayName = formatSourceName(s.village ?? s.id);
          const isSelected = s.id === selectedId;
          return (
            <div key={s.id} className="planner-item">
              <button
                type="button"
                className={`planner-item-btn ${isSelected ? 'is-selected' : ''}`}
                onClick={() => onSelect(s.id)}
              >
                <span className="planner-rank">#{idx + 1}</span>
                <span className="planner-info">
                  <span className="planner-name-row">
                    <strong className="planner-name">{displayName} ({s.id})</strong>
                  </span>
                  <span className="planner-meta">
                    {districtName(s.district)}
                  </span>
                </span>
                <span className="planner-badge">
                  <LevelBadge level={s.level} score={s.score} />
                </span>
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
