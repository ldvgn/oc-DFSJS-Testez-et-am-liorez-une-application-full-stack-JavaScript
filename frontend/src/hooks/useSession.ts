import { useEffect, useRef, useState } from "react";
import { Session, User } from "../types";
import { sessionService } from "../services/session.service";
import axios from "axios";
import { logger } from "../utils/logger";

/**
 * Loads and manages a session by id.
 *
 * @param id - Session id
 * @returns
 * - Session state (`session`, `loading`, `error`)
 * - `fetchSession`, `participate`, `unparticipate`, and `deleteSession` actions.
 */
export function useSession(id: Session["id"]) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  /**
   * Fetches the current session and cancels any previous request in flight.
   *
   * @returns A promise resolved once the state is updated.
   */
  const fetchSession = async () => {
    if (!id || Number.isNaN(id)) {
      setLoading(false);
      return;
    }

    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const response = await sessionService.getById(id, controller.signal);
      if (!controller.signal.aborted) setSession(response.data);
    } catch (err) {
      if (!axios.isCancel(err)) {
        setError("Failed to load session details");
        logger.error("Failed to load teachers", err);
      }
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  };

  /**
   * Reloads the session whenever `id` changes and cancels the request on unmount.
   */
  useEffect(() => {
    fetchSession();
    return () => controllerRef.current?.abort();
  }, [id]);

  /**
   * Registers a user for the session then refreshes the data.
   *
   * @param userId - Id of the user to register.
   * @returns A promise resolved after the session reloads.
   */
  const participate = async (userId: User["id"]) => {
    await sessionService.participate(id, userId);
    await fetchSession();
  };

  /**
   * Unregisters a user from the session then refreshes the data.
   *
   * @param userId - Id of the user to unregister.
   * @returns A promise resolved after the session reloads.
   */
  const unparticipate = async (userId: User["id"]) => {
    await sessionService.unparticipate(id, userId);
    await fetchSession();
  };

  /**
   * Deletes the current session.
   *
   * @returns A promise resolved once the deletion is done.
   */
  const deleteSession = async () => {
    await sessionService.delete(id);
  };

  return {
    session,
    loading,
    error,
    participate,
    unparticipate,
    deleteSession,
  };
}
