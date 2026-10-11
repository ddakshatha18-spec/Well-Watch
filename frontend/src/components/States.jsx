import { useState } from 'react';

export function describeError(err) {
  switch (err?.kind) {
    case 'network':
      return {
        title: "Can't reach the WellWatch API",
        text: 'Check your internet connection. If other sites load fine, the API may not allow requests from this website yet (a CORS setting on the backend).',
      };
    case 'timeout':
      return { title: 'The API is taking too long', text: 'The server did not answer in time. Try again in a moment.' };
    case 'unauthorized':
      return {
        title: 'An access token is required',
        text: 'The WellWatch API currently requires authorization for this request. Enter your demo access token below to connect in this session, or wait for public read permissions to be enabled.',
      };
    case 'forbidden':
      return { title: 'Access was refused', text: err.message };
    case 'not_found':
      return { title: 'Not found', text: err.message };
    case 'validation':
      return { title: 'The server rejected the values', text: err.message };
    case 'server':
      return { title: 'The server had a problem', text: 'This is not caused by anything you did. Try again in a moment.' };
    case 'invalid_response':
      return { title: 'Unexpected reply from the API', text: err.message };
    default:
      return { title: 'Something went wrong', text: err?.message || 'Please try again.' };
  }
}

export function TokenField({ onSubmit, id = 'token-field' }) {
  const [value, setValue] = useState('');
  return (
    <form
      className="token-form"
      onSubmit={(e) => {
        e.preventDefault();
        if (value.trim()) onSubmit(value.trim());
      }}
    >
      <label htmlFor={id}>Access token</label>
      <div className="token-row">
        <input id={id} type="password" autoComplete="off" value={value} onChange={(e) => setValue(e.target.value)} />
        <button type="submit" className="btn btn-secondary" disabled={!value.trim()}>
          Use token
        </button>
      </div>
      <p className="hint">Held in this browser tab's memory only. Development stopgap: do not share a backend secret with users through this box.</p>
    </form>
  );
}

export function ErrorBox({ error, onRetry, onToken }) {
  const { title, text } = describeError(error);
  return (
    <div className="state state-error" role="alert">
      <h2>{title}</h2>
      <p>{text}</p>
      {error?.kind === 'unauthorized' && onToken && <TokenField onSubmit={onToken} />}
      {onRetry && (
        <button type="button" className="btn btn-secondary" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}

export function Loading({ label }) {
  return (
    <div className="state state-loading" role="status" aria-live="polite">
      <span className="spinner" aria-hidden="true" />
      <p>{label}</p>
    </div>
  );
}

export function Empty({ title, children }) {
  return (
    <div className="state state-empty">
      <h2>{title}</h2>
      {children && <p>{children}</p>}
    </div>
  );
}
