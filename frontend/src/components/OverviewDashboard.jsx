import { districtName } from '../lib/format.js';

export default function OverviewDashboard({ items, counts, onOpenReport }) {
  const total = items.length;
  const uniqueDistricts = new Set(items.map((s) => s.district).filter(Boolean)).size;

  return (
    <section className="overview-dashboard" aria-label="Inspection overview and key metrics">
      <div className="overview-header">
        <div>
          <h2 className="overview-title">Inspection Priority Intelligence</h2>
          <p className="overview-subtitle">
            Proactive decision-support for field engineers allocating inspection visits across rural Bihar water sources.
          </p>
        </div>
        <div className="overview-cta">
          <button type="button" className="btn btn-primary" onClick={() => onOpenReport(null)}>
            Submit Field Observation
          </button>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="kpi-grid">
        <div className="kpi-card kpi-total">
          <span className="kpi-label">Monitored Sources</span>
          <div className="kpi-value-row">
            <span className="kpi-value">{total}</span>
            <span className="kpi-tag">{uniqueDistricts} Districts</span>
          </div>
          <span className="kpi-meta">100% Bihar rural network</span>
        </div>

        <div className="kpi-card kpi-high">
          <span className="kpi-label">High Priority Queue</span>
          <div className="kpi-value-row">
            <span className="kpi-value">{counts.High}</span>
            <span className="kpi-badge kpi-badge-high">Immediate Attention</span>
          </div>
          <span className="kpi-meta">
            {total > 0 ? Math.round((counts.High / total) * 100) : 0}% of network requiring priority visit
          </span>
        </div>

        <div className="kpi-card kpi-medium">
          <span className="kpi-label">Medium Priority</span>
          <div className="kpi-value-row">
            <span className="kpi-value">{counts.Medium}</span>
            <span className="kpi-badge kpi-badge-med">Routine Watch</span>
          </div>
          <span className="kpi-meta">Scheduled secondary inspection</span>
        </div>

        <div className="kpi-card kpi-low">
          <span className="kpi-label">Low Priority / Unscored</span>
          <div className="kpi-value-row">
            <span className="kpi-value">{counts.Low + counts.Unscored}</span>
            <span className="kpi-badge kpi-badge-low">Stable / Monitoring</span>
          </div>
          <span className="kpi-meta">
            {counts.Low} low priority · {counts.Unscored} unscored
          </span>
        </div>
      </div>

      {/* Honest Framing & Guidance Strip */}
      <div className="guidance-banner">
        <div className="guidance-pill">Decision Support</div>
        <p className="guidance-text">
          <strong>How to use this score:</strong> Priority scores (0.00 – 1.00) reflect inspection urgency derived from regional groundwater telemetry and field feedback. A high score flags sources where proactive inspection is most needed before dry-season failures. It does <em>not</em> guarantee potability or certify mechanical pump failure.
        </p>
      </div>
    </section>
  );
}
