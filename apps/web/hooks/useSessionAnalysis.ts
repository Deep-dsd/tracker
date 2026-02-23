import { useState, useEffect } from 'react';
import { SessionDocument } from '@/types/session';
import { getSession } from '@/lib/api';

export function useSessionAnalysis(sessionId: string | null) {
  const [session, setSession] = useState<SessionDocument | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setSession(null);
      setLoading(false);
      return;
    }

    const fetchSession = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getSession(sessionId);
        setSession(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load session');
        setSession(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [sessionId]);

  return { session, loading, error };
}
