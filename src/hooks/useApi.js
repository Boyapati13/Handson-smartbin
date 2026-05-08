import { useState, useEffect, useCallback, useRef } from 'react';

// In production the API lives on the same host as the page (just different port).
// This means if the VM IP changes, no rebuild is needed — it follows the hostname.
const BASE = import.meta.env.VITE_API_URL ||
  (typeof window !== 'undefined' && window.location.hostname !== 'localhost'
    ? `http://${window.location.hostname}:3001/api`
    : 'http://localhost:3001/api');

/** Generic fetcher with loading / error state and manual refetch. */
export function useApi(path, { skip = false, deps = [] } = {}) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(!skip);
  const [error,   setError]   = useState(null);
  const abortRef = useRef(null);

  const fetch_ = useCallback(async () => {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BASE}${path}`, { signal: ctrl.signal });
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const json = await res.json();
      setData(json);
    } catch (e) {
      if (e.name !== 'AbortError') setError(e.message);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, ...deps]);

  useEffect(() => {
    if (!skip) fetch_();
    return () => abortRef.current?.abort();
  }, [fetch_, skip]);

  return { data, loading, error, refetch: fetch_ };
}

/** POST helper. Returns { mutate, loading, error }. */
export function useMutation(path) {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const mutate = useCallback(async (body) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BASE}${path}`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      return await res.json();
    } catch (e) {
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [path]);

  return { mutate, loading, error };
}
