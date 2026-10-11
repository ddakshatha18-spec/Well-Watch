import { useCallback, useEffect, useRef, useState } from 'react';
import { getSource } from '../api/client.js';

const IDLE = { status: 'idle', data: null, error: null };

// Fetches one source's detail. Results are cached per id until `version` changes
// (the app bumps it after a report is saved), so re-selecting a source costs no request.
export function useSourceDetail(id, token, version) {
  const [state, setState] = useState(IDLE);
  const [retry, setRetry] = useState(0);
  const cache = useRef(new Map());
  const cachedVersion = useRef(version);

  useEffect(() => {
    if (cachedVersion.current !== version) {
      cache.current.clear();
      cachedVersion.current = version;
    }
    if (!id) {
      setState(IDLE);
      return undefined;
    }
    const hit = cache.current.get(id);
    if (hit) {
      setState({ status: 'ready', data: hit, error: null });
      return undefined;
    }
    const ctl = new AbortController();
    setState({ status: 'loading', data: null, error: null });
    getSource(id, { token, signal: ctl.signal })
      .then((data) => {
        cache.current.set(id, data);
        setState({ status: 'ready', data, error: null });
      })
      .catch((error) => {
        if (error?.name === 'AbortError') return;
        setState({ status: 'error', data: null, error });
      });
    return () => ctl.abort();
  }, [id, token, version, retry]);

  const reload = useCallback(() => setRetry((n) => n + 1), []);
  return [state, reload];
}
