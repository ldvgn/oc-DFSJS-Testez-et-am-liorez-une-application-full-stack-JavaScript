import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Session } from "../types";
import { sessionsService } from "../services/sessions.service";

/**
 * Hook de gestion des sessions : charge la liste au montage, permet d'en supprimer.
 *
 * @returns `sessions` (liste), `loading`, `error`, et `deleteSession(id)`.
 */
export function useSessions() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  /**
   * Récupère la liste des sessions.
   * Annule la requête précédente, relance la requête, ignore le résultat si annulé.
   */
  const fetchSessions = async () => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    try {
      setLoading(true);
      setError(null);

      const response = await sessionsService.getAll(controller.signal);
      if (!controller.signal.aborted) setSessions(response.data);
    } catch (err) {
      if (!axios.isCancel(err)) setError("Failed to load sessions");
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  };

  /**
   * Chargement initial : annule la requête en cours si le composant est démonté.
   */
  useEffect(() => {
    fetchSessions();
    return () => controllerRef.current?.abort();
  }, []);

  /**
   * Supprime une session puis recharge la liste
   *
   * @param sessionId - Identifiant de la session à supprimer
   */
  const deleteSession = async (sessionId: Session["id"]) => {
    await sessionsService.delete(sessionId);
    await fetchSessions();
  };

  return { sessions, loading, error, deleteSession };
}
