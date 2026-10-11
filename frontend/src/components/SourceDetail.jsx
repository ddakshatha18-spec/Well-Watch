import LevelBadge from './LevelBadge.jsx';
import { ErrorBox, Loading } from './States.jsx';
import { reasonsFor } from './SourceList.jsx';
import { dash, districtName, fmtBool, fmtInt, fmtNum, formatSourceName, titleCase } from '../lib/format.js';

function Reasons({ source, lang }) {
  const { list, fallback } = reasonsFor(source, lang);
  if (!list.length) return <p className="muted">The API returned no reasons for this source.</p>;
  return (
    <>
      <ul className="reasons">
        {list.map((r, i) => (
          <li key={i}>{r}</li>
        ))}
      </ul>
      {fallback && <p className="hint">A translation is not available for this source yet, so the English reasons are shown.</p>}
    </>
  );
}

function Factors({ factors }) {
  if (!factors.length) return null;
  return (
    <section className="detail-section">
      <h3>How the score is built</h3>
      <ul className="factors">
        {factors.map((f) => {
          const pct =
            f.contribution !== null && f.weight
              ? f.contribution / f.weight
              : f.value !== null
                ? f.value
                : null;
          return (
            <li key={f.label} className="factor-item">
              <div className="factor-head">
                <span className="factor-name">{titleCase(f.label)}</span>
                <span className="mono factor-val">
                  {f.contribution !== null ? `+${fmtNum(f.contribution)}` : fmtNum(f.value)}
                  {f.weight !== null && ` of ${fmtNum(f.weight)}`}
                </span>
              </div>
              {pct !== null && (
                <div className="bar" aria-hidden="true">
                  <i style={{ width: `${Math.max(0, Math.min(1, pct)) * 100}%` }} />
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export default function SourceDetail({ summary, state, lang, onRetry, onReport, onToken }) {
  if (!summary) {
    return (
      <section className="detail detail-empty" aria-label="Source detail">
        <h2>Pick a source</h2>
        <p>Select a source from the ranked list or the map to inspect why it has been prioritized.</p>
      </section>
    );
  }
  const d = state?.status === 'ready' ? state.data : null;
  const src = d ?? summary;
  const t = d?.trend;

  return (
    <section className="detail" aria-label="Source detail" aria-live="polite">
      <header className="detail-head">
        <div>
          <p className="eyebrow">
            {districtName(src.district)} · <span className="mono">{src.id}</span>
          </p>
          <div className="detail-title-row">
            <h2>{formatSourceName(src.village ?? src.id)}</h2>
          </div>
        </div>
        <LevelBadge level={src.level} score={src.score} />
      </header>

      <div className="tags">
        {src.sourceType && <span className="tag tag-plain">{titleCase(src.sourceType)}</span>}
      </div>

      <section className="detail-section">
        <h3>Why inspect this source</h3>
        <Reasons source={src} lang={lang} />
      </section>

      <section className="detail-section" aria-label="Water access impact">
        <h3>Water access impact</h3>
        <dl className="facts">
          <div>
            <dt>Households served</dt>
            <dd>{src.households !== null && src.households !== undefined ? fmtInt(src.households) : 'Data not available'}</dd>
          </div>
          <div>
            <dt>Alternative water source available</dt>
            <dd>
              {src.alternativeSource !== null && src.alternativeSource !== undefined
                ? fmtBool(src.alternativeSource)
                : 'Data not available'}
            </dd>
          </div>
          <div>
            <dt>Reported water-supply problem</dt>
            <dd>
              {src.reportedProblem ? titleCase(src.reportedProblem) : 'Data not available'}
            </dd>
          </div>
        </dl>
        <p className="hint">
          Inspection priority indicates which sources may need attention first. Community impact indicates how many people may depend on them.
        </p>
      </section>

      {state?.status === 'loading' && <Loading label="Loading full detail…" />}
      {state?.status === 'error' && <ErrorBox error={state.error} onRetry={onRetry} onToken={onToken} />}

      {d && (
        <>
          <Factors factors={d.factors} />
          {d.dataCompleteness && <p className="hint">Data completeness: {d.dataCompleteness}</p>}

          <section className="detail-section">
            <h3>Groundwater trend</h3>
            <dl className="facts">
              <div>
                <dt>Weighted trend slope</dt>
                <dd className="mono">{fmtNum(t?.slope, 3)}</dd>
              </div>
              <div>
                <dt>Statistically significant</dt>
                <dd>{fmtBool(t?.significant)}</dd>
              </div>
              <div>
                <dt>Nearest station</dt>
                <dd>{t?.nearestStationKm === null || t?.nearestStationKm === undefined ? dash : `${fmtNum(t?.nearestStationKm, 1)} km`}</dd>
              </div>
              {t?.nearestStationId && (
                <div>
                  <dt>Station ID</dt>
                  <dd className="mono text-xs">{t.nearestStationId}</dd>
                </div>
              )}
              {t?.matchingMethod && (
                <div>
                  <dt>Matching method</dt>
                  <dd className="text-xs">{titleCase(t.matchingMethod)}</dd>
                </div>
              )}
              <div>
                <dt>Measurement status</dt>
                <dd>{t?.measurementStatus ? <span className="tag">{titleCase(t.measurementStatus)}</span> : dash}</dd>
              </div>
            </dl>
            <p className="hint">
              Provisional CGWB monitoring station evidence. Values are shown exactly as returned by the backend. Slope signs are mathematical gradients without presumed depletion/recovery conventions.
            </p>
          </section>

          <section className="detail-section">
            <h3>Source facts</h3>
            <dl className="facts">
              <div>
                <dt>Pump depth</dt>
                <dd>{d.pumpDepthM === null ? 'Not provided' : `${fmtNum(d.pumpDepthM, 1)} m`}</dd>
              </div>
              <div>
                <dt>Households served</dt>
                <dd>{d.households === null ? 'Not provided' : fmtInt(d.households)}</dd>
              </div>
              <div>
                <dt>Installed</dt>
                <dd>{d.installedYear === null ? 'Not provided' : d.installedYear}</dd>
              </div>
              <div>
                <dt>Location</dt>
                <dd className="mono">{d.lat === null ? 'Not provided' : `${d.lat.toFixed(3)}, ${d.lon.toFixed(3)}`}</dd>
              </div>
            </dl>
          </section>

          <section className="detail-section">
            <h3>Recent reports</h3>
            {d.reports.length === 0 ? (
              <p className="muted">No reports recorded for this source.</p>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Flow</th>
                      <th>Failure</th>
                    </tr>
                  </thead>
                  <tbody>
                    {d.reports.map((r, i) => (
                      <tr key={`${r.date}-${i}`}>
                        <td className="mono">{r.date ?? dash}</td>
                        <td>{titleCase(r.yieldLevel)}</td>
                        <td>
                          {fmtBool(r.failure)}
                          {r.synthetic === true && <span className="tag">Synthetic</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
          {d.updatedAt && <p className="hint">Score last updated: {d.updatedAt}</p>}
        </>
      )}

      <div className="detail-action-bar">
        <button type="button" className="btn btn-primary btn-block" onClick={() => onReport(src.id)}>
          Report an observation for this source
        </button>
      </div>
    </section>
  );
}
