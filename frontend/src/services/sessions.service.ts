import { Session } from "../types";
import api from "./api";

export const sessionsService = {
  /**
   * Récupère toutes les sessions.
   *
   * @param signal - Signal d'annulation optionnel (AbortController).
   * @returns Réponse axios contenant le tableau des sessions.
   */
  getAll: (signal?: AbortSignal) => api.get<Session[]>("/session", { signal }),

  /**
   * Supprime une session.
   *
   * @param sessionId - Identifiant de la session à supprimer.
   * @returns Réponse axios de la requête DELETE.
   */
  delete: (sessionId: Session["id"]) => api.delete(`/session/${sessionId}`),
};
