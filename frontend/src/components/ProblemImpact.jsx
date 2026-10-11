export default function ProblemImpact() {
  return (
    <div className="problem-impact-container" aria-label="Problem statement and civic impact">
      <header className="page-section-header">
        <span className="eyebrow">Hackathon Context & Civic Tech Mission</span>
        <h2>Problem Statement & Operational Impact</h2>
        <p className="lead-text">
          Rural water infrastructure in Bihar faces severe resource constraints: hundreds of village handpumps and borewells rely on small, overburdened inspection teams who currently operate reactively rather than proactively.
        </p>
      </header>

      {/* The Core Problem */}
      <section className="problem-card-grid">
        <div className="impact-card impact-card-challenge">
          <div className="impact-card-badge">The Challenge</div>
          <h3>Reactive Maintenance Leaves Villages Stranded</h3>
          <p>
            In rural districts across Bihar, water pumps are typically inspected only after they have completely failed or run dry. By the time a breakdown report reaches the Public Health Engineering Department (PHED), communities may have gone days or weeks without safe drinking water, forcing reliance on contaminated surface sources.
          </p>
          <ul className="challenge-bullets">
            <li><strong>Severe staffing ratios:</strong> 1 field technician per 50–100 remote village sources.</li>
            <li><strong>Siloed data:</strong> Central groundwater observation data is rarely accessible to local maintenance engineers.</li>
            <li><strong>Unstructured complaints:</strong> Community signals get lost in informal phone calls and paper logs.</li>
          </ul>
        </div>

        <div className="impact-card impact-card-solution">
          <div className="impact-card-badge impact-badge-solution">The WellWatch Solution</div>
          <h3>Proactive Prioritization with Explainable Scoring</h3>
          <p>
            WellWatch bridges the gap between regional scientific telemetry and ground-level dispatch. By prioritizing pumps based on hydrogeological stress, infrastructure age, and early community flow warnings, inspection crews visit vulnerable pumps <em>before</em> they fail.
          </p>
          <ul className="solution-bullets">
            <li><strong>Optimized Routing:</strong> Focus scarce technician hours on the top 10% highest-risk water sources.</li>
            <li><strong>Explainable Reasons:</strong> Technicians know exactly why a pump was prioritized (e.g. falling groundwater + low flow report).</li>
            <li><strong>Closed-Loop Feedback:</strong> Field observations instantly update the cloud scoring engine.</li>
          </ul>
        </div>
      </section>

      {/* User Personas */}
      <section className="personas-section">
        <h3 className="section-subtitle">Who Uses WellWatch</h3>
        <div className="personas-grid">
          <div className="persona-card">
            <div className="persona-role">District Water Engineer</div>
            <div className="persona-org">PHED / Jal Jeevan Mission</div>
            <p className="persona-desc">
              Plans weekly inspection routes, allocates repair budgets, and monitors district-wide groundwater vulnerability across all blocks.
            </p>
          </div>

          <div className="persona-card">
            <div className="persona-role">Block Field Technician</div>
            <div className="persona-org">Panchayat Operations Team</div>
            <p className="persona-desc">
              Uses mobile view to access prioritized inspection lists on-site, inspects pump cylinder wear, and logs observations in a few taps.
            </p>
          </div>

          <div className="persona-card">
            <div className="persona-role">Village Water Committee</div>
            <div className="persona-org">Gram Panchayat Jal Samiti</div>
            <p className="persona-desc">
              Submits early-warning signals when water flow decreases, ensuring their village pump gets prioritized before dry-season peak.
            </p>
          </div>
        </div>
      </section>

      {/* Transition Roadmap to Production */}
      <section className="roadmap-section">
        <h3 className="section-subtitle">Roadmap: From Hackathon MVP to Production Deployment</h3>
        <div className="roadmap-timeline">
          <div className="roadmap-step">
            <div className="roadmap-dot current" />
            <div className="roadmap-content">
              <span className="roadmap-phase">Phase 1 (Current AWS Hackathon MVP)</span>
              <h4>Synthetic Demo & Provisional Telemetry</h4>
              <p>
                Demonstrates end-to-end cloud architecture using 24 synthetic Bihar village records, CGWB telemetry station mapping, serverless scoring Lambda, and responsive React frontend on AWS Amplify.
              </p>
            </div>
          </div>

          <div className="roadmap-step">
            <div className="roadmap-dot" />
            <div className="roadmap-content">
              <span className="roadmap-phase">Phase 2 (Enterprise Security & Scale)</span>
              <h4>AWS Cognito & JJM IMIS Integration</h4>
              <p>
                Implement role-based AWS Cognito authentication for verified field staff, connect live Jal Jeevan Mission pump registries, and configure Amazon SNS alerts for critical water drop events.
              </p>
            </div>
          </div>

          <div className="roadmap-step">
            <div className="roadmap-dot" />
            <div className="roadmap-content">
              <span className="roadmap-phase">Phase 3 (Statewide Deployment)</span>
              <h4>IoT Telemetry & Vernacular Voice Interface</h4>
              <p>
                Deploy solar IoT depth sensors at high-traffic wells, integrate AWS Polly/Transcribe for Hindi/Maithili voice reporting from rural communities, and scale across all 38 districts of Bihar.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
