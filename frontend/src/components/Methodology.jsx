export default function Methodology() {
  return (
    <div className="methodology-container" aria-label="Data and methodology guide">
      <header className="page-section-header">
        <span className="eyebrow">Technical Architecture & Governance</span>
        <h2>How WellWatch Works: Data & Methodology</h2>
        <p className="lead-text">
          WellWatch integrates regional groundwater observation telemetry, spatial association, and community reports into an actionable inspection-priority ranking for rural water infrastructure teams.
        </p>
      </header>

      {/* 4-Step Pipeline Flow */}
      <section className="method-pipeline">
        <h3 className="section-subtitle">The 4-Stage Intelligence Pipeline</h3>
        <div className="pipeline-grid">
          <div className="pipeline-card">
            <div className="pipeline-step-num">01</div>
            <h4 className="pipeline-step-title">Groundwater Telemetry</h4>
            <p className="pipeline-step-desc">
              Historical water-level measurements from Central Ground Water Board (CGWB) stations across Bihar are processed to compute provisional seasonal slopes and statistical significance.
            </p>
            <div className="pipeline-tag">Telemetry Processing</div>
          </div>

          <div className="pipeline-card">
            <div className="pipeline-step-num">02</div>
            <h4 className="pipeline-step-title">Spatial Association</h4>
            <p className="pipeline-step-desc">
              Village water sources (handpumps, borewells, public taps) are mapped against regional monitoring stations using Inverse Distance Weighting (IDW 3-nearest) to estimate local groundwater behavior.
            </p>
            <div className="pipeline-tag">IDW Spatial Matching</div>
          </div>

          <div className="pipeline-card">
            <div className="pipeline-step-num">03</div>
            <h4 className="pipeline-step-title">Multi-Factor Scoring</h4>
            <p className="pipeline-step-desc">
              The AWS Lambda scoring engine evaluates groundwater trend velocity, distance to station, pump depth, household reliance, and validated community observations into a normalized priority score (0.00 – 1.00).
            </p>
            <div className="pipeline-tag">Scoring Engine</div>
          </div>

          <div className="pipeline-card">
            <div className="pipeline-step-num">04</div>
            <h4 className="pipeline-step-title">Actionable Dispatch</h4>
            <p className="pipeline-step-desc">
              Block and district water engineers receive a clear, ranked schedule of pumps requiring inspection, accompanied by explainable reasons and factor breakdowns.
            </p>
            <div className="pipeline-tag">Decision Support</div>
          </div>
        </div>
      </section>

      {/* Mathematical & Weighting Model */}
      <section className="method-details-grid">
        <div className="method-box">
          <h3>Scoring Engine Architecture</h3>
          <p>
            The ranking algorithm combines physical infrastructure facts with dynamic hydrogeological signals:
          </p>
          <ul className="method-list">
            <li>
              <strong>Groundwater Velocity Factor:</strong> Weighted rate of water level change from proximal CGWB telemetry stations.
            </li>
            <li>
              <strong>Proximity Confidence:</strong> Decay penalty based on distance (km) between source and telemetry station.
            </li>
            <li>
              <strong>Vulnerability Weight:</strong> Pump installation depth, age, and estimated dependent households.
            </li>
            <li>
              <strong>Community Field Observations:</strong> Validated user reports (low flow or breakdown) dynamically adjust inspection urgency.
            </li>
          </ul>
        </div>

        <div className="method-box">
          <h3>Provenance & Data Conventions</h3>
          <p>
            WellWatch maintains rigorous scientific honesty regarding telemetry interpretations:
          </p>
          <ul className="method-list">
            <li>
              <strong>Provisional Groundwater Trends:</strong> Station trends are mathematical regressions across historical records and are marked <em>Unverified</em>.
            </li>
            <li>
              <strong>Trend Sign Interpretation:</strong> Trend slope values are reported directly as numerical gradients without assuming depletion or recharge conventions until sensor calibrations are verified.
            </li>
            <li>
              <strong>Synthetic Village Records:</strong> The 24 village water-source records in this demo are synthetically generated reference points mapped to Bihar coordinates.
            </li>
          </ul>
        </div>
      </section>

      {/* Critical System Limitations */}
      <section className="limitations-section">
        <div className="limitations-banner">
          <h3 className="limitations-title">Transparent System Limitations</h3>
          <p className="limitations-intro">
            WellWatch is designed exclusively as an operational triage tool. To prevent misuse, the following boundaries must be recognized:
          </p>
          <div className="limitations-grid">
            <div className="limitation-item">
              <span className="limitation-icon">✕</span>
              <div>
                <strong>Not a Water Safety Certification:</strong>
                <p>WellWatch does not test or certify microbial, chemical (arsenic/fluoride), or physical potability of drinking water.</p>
              </div>
            </div>

            <div className="limitation-item">
              <span className="limitation-icon">✕</span>
              <div>
                <strong>Not a Mechanical Failure Predictor:</strong>
                <p>The priority score guides human inspection schedules; it cannot forecast exact mechanical failure dates or pipe ruptures.</p>
              </div>
            </div>

            <div className="limitation-item">
              <span className="limitation-icon">✕</span>
              <div>
                <strong>Regional Telemetry vs In-Well Sensors:</strong>
                <p>Regional station telemetry measures ambient aquifer behavior, not direct water levels inside individual village handpump cylinders.</p>
              </div>
            </div>

            <div className="limitation-item">
              <span className="limitation-icon">✕</span>
              <div>
                <strong>Provisional Demonstration Scope:</strong>
                <p>The MVP operates on 24 synthetic demo records. Real-world deployment requires integration with state water department registries.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
