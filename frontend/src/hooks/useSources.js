import { useCallback, useEffect, useState } from 'react';
import { getSources } from '../api/client.js';

export function useSources(token) {
  const [state, setState] = useState({ status: 'loading', items: [], skipped: 0, error: null });
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    const ctl = new AbortController();
    setState((s) => (s.items.length ? s : { ...s, status: 'loading', error: null }));
    getSources({ token, signal: ctl.signal })
      .then(({ items, skipped }) => setState({ status: 'ready', items, skipped, error: null }))
      .catch((error) => {
        if (error?.name === 'AbortError') return;
        setState({ status: 'error', items: [], skipped: 0, error });
      });
    return () => ctl.abort();
  }, [token, nonce]);

  const reload = useCallback(() => setNonce((n) => n + 1), []);
  return [state, reload];
}
