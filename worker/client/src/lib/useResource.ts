import { useCallback, useEffect, useState } from 'react';
import { api } from './api';

/**
 * Fetches an API resource and tracks failure as a first-class state.
 *
 * Every page did `useState(null)` plus `api(...).then(r => r.success && set(...))`,
 * which drops the failure on the floor: a 404, a 500 or a dropped connection
 * left the component on "Loading..." forever with no message and no way back.
 * ArticleView and CategoryView were the worst of it, because a soft-deleted
 * article legitimately returns 404 and the user just sat there.
 *
 * `reload` is returned so the error state can offer a retry rather than making
 * the user reload the page and lose their place.
 */
export interface Resource<T> {
  data: T | null;
  error: string;
  loading: boolean;
  reload: () => void;
}

export function useResource<T = any>(path: string | null, notFound?: string): Resource<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [nonce, setNonce] = useState(0);

  const reload = useCallback(() => setNonce((n) => n + 1), []);

  useEffect(() => {
    if (!path) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError('');

    api(path).then((r) => {
      // Navigating away mid-flight must not write into an unmounted component,
      // and must not overwrite the newer request's result.
      if (cancelled) return;
      setLoading(false);
      if (r.success) {
        setData(r.data);
        return;
      }
      setData(null);
      setError(r.error || notFound || 'This content could not be loaded.');
    });

    return () => {
      cancelled = true;
    };
  }, [path, nonce, notFound]);

  return { data, error, loading, reload };
}
