import { useState, useEffect } from 'react';

interface SessionStatusResponse {
  session_id: string;
  overall_status: string;
  list_upload_status: string;
  supplier_name_validation_status: string;
  screening_analysis_status: string;
  update_time: string;
}

interface UseSessionStatusResult {
  status: SessionStatusResponse | null;
  error: string | null;
}

const useSessionStatus = (sessionId: string): UseSessionStatusResult => {
  const [status, setStatus] = useState<SessionStatusResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) return; // Prevent API call if sessionId is empty

    const fetchStatus = async () => {
      const sseUrl = `/orc-api/status/session-status?session_id=${sessionId}`;
      const eventSource = new EventSource(sseUrl);

      try {
        eventSource.onmessage = (event) => {
          const data = JSON.parse(event.data);
          setStatus(data as unknown as SessionStatusResponse);
        };

        eventSource.onerror = (error) => {
          console.error('SSE error:', error);
          eventSource.close();
        };
        // setStatus(result as unknown as SessionStatusResponse);
      } catch (err) {
        setError((err as Error).message);
      }
    };

    fetchStatus();
  }, [sessionId]);

  return { status, error };
};

export default useSessionStatus;
