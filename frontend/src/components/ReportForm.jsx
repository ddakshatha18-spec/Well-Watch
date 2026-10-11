import { useEffect, useRef, useState } from 'react';
import { postReport } from '../api/client.js';
import { todayISO, validateReport, YIELD_LEVELS } from '../lib/validate.js';
import { ErrorBox } from './States.jsx';
import LevelBadge from './LevelBadge.jsx';

export default function ReportForm({ sources, initialSourceId, token, onToken, onClose, onSaved }) {
  const [values, setValues] = useState({ sourceId: initialSourceId || '', yieldLevel: '', failureFlag: false, date: todayISO() });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | submitting | done
  const [apiError, setApiError] = useState(null);
  const [result, setResult] = useState(null);
  const busy = useRef(false);
  const dialog = useRef(null);
  const first = useRef(null);

  const knownIds = sources.map((s) => s.id);
  const sorted = [...sources].sort((a, b) => (a.village ?? a.id).localeCompare(b.village ?? b.id));
  const before = sources.find((s) => s.id === values.sourceId);
  const set = (patch) => setValues((v) => ({ ...v, ...patch }));

  useEffect(() => {
    first.current?.focus();
  }, []);

  // Keep keyboard focus inside the dialog and let Escape close it.
  function onKeyDown(e) {
    if (e.key === 'Escape' && status !== 'submitting') onClose();
    if (e.key !== 'Tab') return;
    const nodes = dialog.current.querySelectorAll('button:not([disabled]), input:not([disabled]), select, a[href]');
    if (!nodes.length) return;
    const firstEl = nodes[0];
    const lastEl = nodes[nodes.length - 1];
    if (e.shiftKey && document.activeElement === firstEl) {
      e.preventDefault();
      lastEl.focus();
    } else if (!e.shiftKey && document.activeElement === lastEl) {
      e.preventDefault();
      firstEl.focus();
    }
  }

  async function submit(e) {
    e.preventDefault();
    if (busy.current) return; // blocks double submits
    const errs = validateReport(values, { knownIds });
    setErrors(errs);
    if (Object.keys(errs).length) {
      dialog.current.querySelector('[aria-invalid="true"]')?.focus();
      return;
    }
    busy.current = true;
    setStatus('submitting');
    setApiError(null);
    try {
      const r = await postReport(values, { token });
      setResult(r);
      setStatus('done');
      onSaved(values.sourceId);
    } catch (err) {
      setApiError(err);
      setStatus('idle'); // values stay in the form so nothing has to be retyped
    } finally {
      busy.current = false;
    }
  }

  const submitting = status === 'submitting';

  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && !submitting && onClose()}>
      <div ref={dialog} className="drawer" role="dialog" aria-modal="true" aria-labelledby="report-title" onKeyDown={onKeyDown}>
        <header className="drawer-head">
          <h2 id="report-title">Report an observation</h2>
          <button type="button" className="btn btn-ghost" onClick={onClose} disabled={submitting} aria-label="Close report form">
            ✕
          </button>
        </header>

        {status === 'done' ? (
          <div className="drawer-body">
            <div className="state state-success" role="status">
              <h3>Report saved</h3>
              <p>The server confirmed your report for <strong>{before?.village ?? values.sourceId}</strong>.</p>
              {result.level || result.score !== null ? (
                <p className="change">
                  Priority now: <LevelBadge level={result.level} score={result.score} />
                  {before && (before.level || before.score !== null) && (
                    <span className="muted"> (before: {before.level ?? 'not scored'}{before.score !== null ? ` ${before.score.toFixed(2)}` : ''})</span>
                  )}
                </p>
              ) : (
                <p className="muted">The server did not return a new score. The ranking has been refreshed.</p>
              )}
              {result.reasons.length > 0 && (
                <ul className="reasons">{result.reasons.map((r, i) => <li key={i}>{r}</li>)}</ul>
              )}
            </div>
            <button type="button" className="btn btn-primary" onClick={onClose}>Back to the dashboard</button>
          </div>
        ) : (
          <div className="drawer-body">
            <p className="hint">Takes a few taps. Reports go to the demo backend and can change the ranking.</p>
            <form onSubmit={submit} noValidate>
              <div className="field">
                <label htmlFor="r-source">Water source</label>
                <select
                  id="r-source"
                  ref={first}
                  value={values.sourceId}
                  onChange={(e) => set({ sourceId: e.target.value })}
                  aria-invalid={errors.sourceId ? 'true' : undefined}
                  aria-describedby={errors.sourceId ? 'r-source-err' : undefined}
                >
                  <option value="">Choose a source…</option>
                  {sorted.map((s) => (
                    <option key={s.id} value={s.id}>{s.village ?? s.id} — {s.id}</option>
                  ))}
                </select>
                {errors.sourceId && <p className="field-error" id="r-source-err">{errors.sourceId}</p>}
              </div>

              <fieldset className="field" aria-describedby={errors.yieldLevel ? 'r-yield-err' : undefined}>
                <legend>How much water does it give?</legend>
                <div className="radio-row">
                  {YIELD_LEVELS.map((y, i) => (
                    <label key={y.value} className={`radio${values.yieldLevel === y.value ? ' is-on' : ''}`}>
                      <input
                        type="radio"
                        name="yield"
                        value={y.value}
                        checked={values.yieldLevel === y.value}
                        onChange={() => set({ yieldLevel: y.value })}
                        aria-invalid={errors.yieldLevel && i === 0 ? 'true' : undefined}
                      />
                      {y.label}
                    </label>
                  ))}
                </div>
                {errors.yieldLevel && <p className="field-error" id="r-yield-err">{errors.yieldLevel}</p>}
              </fieldset>

              <label className="check">
                <input type="checkbox" checked={values.failureFlag} onChange={(e) => set({ failureFlag: e.target.checked })} />
                The pump has failed or broken down
              </label>

              <div className="field">
                <label htmlFor="r-date">Date observed</label>
                <input
                  id="r-date"
                  type="date"
                  value={values.date}
                  max={todayISO()}
                  onChange={(e) => set({ date: e.target.value })}
                  aria-invalid={errors.date ? 'true' : undefined}
                  aria-describedby={errors.date ? 'r-date-err' : undefined}
                />
                {errors.date && <p className="field-error" id="r-date-err">{errors.date}</p>}
              </div>

              <button type="submit" className="btn btn-primary btn-block" disabled={submitting} aria-busy={submitting}>
                {submitting ? 'Sending…' : 'Submit report'}
              </button>
            </form>

            {apiError && (
              <ErrorBox
                error={apiError}
                onToken={apiError.kind === 'unauthorized' || apiError.kind === 'forbidden' ? onToken : undefined}
              />
            )}
            {apiError && token && ['unauthorized', 'forbidden'].includes(apiError.kind) && (
              <p className="hint">If you just entered a token, press “Submit report” again. Your answers are still filled in.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
