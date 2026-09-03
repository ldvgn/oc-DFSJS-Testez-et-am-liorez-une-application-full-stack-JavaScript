import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Session } from "../types";
import { sessionService } from "../services/session.service";
import { logger } from "../utils/logger";

/**
 * Session management hook: loads the list on mount, allows deleting one.
 *
 * @returns `sessions` (list), `loading`, `error`, and `deleteSession(id)`.
 */
export function useSessions() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  /**
   * Fetches the list of sessions.
   * Cancels the previous request, re-runs it, and ignores the result if cancelled.
   */
  const fetchSessions = async () => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const response = await sessionService.getAll(controller.signal);
      if (!controller.signal.aborted) setSessions(response.data);
    } catch (err) {
      if (!axios.isCancel(err)) {
        setError("Failed to load sessions");
        logger.error("Failed to load sessions", err);
      }
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  };

  /**
   * Initial load: cancels the in-flight request if the component unmounts.
   */
  useEffect(() => {
    fetchSessions();
    return () => controllerRef.current?.abort();
  }, []);

  /**
   * Deletes a session then reloads the list.
   *
   * @param sessionId - Id of the session to delete.
   */
  const deleteSession = async (sessionId: Session["id"]) => {
    await sessionService.delete(sessionId);
    await fetchSessions();
  };

  return { sessions, loading, error, deleteSession };
}
