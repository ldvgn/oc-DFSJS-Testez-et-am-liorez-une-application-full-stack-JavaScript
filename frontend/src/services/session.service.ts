import { AxiosResponse } from "axios";
import { Session, SessionFormData, User } from "../types";
import api from "./api";

export const sessionService = {
  /**
   * Récupère toutes les sessions.
   *
   * @param signal - Signal d'annulation optionnel (AbortController).
   * @returns Réponse axios contenant le tableau des sessions.
   */
  getAll: (signal?: AbortSignal): Promise<AxiosResponse<Session[]>> =>
    api.get<Session[]>("/session", { signal }),

  /**
   * Récupère une session par son identifiant.
   *
   * @param sessionId - Identifiant de la session.
   * @param signal - Signal d'annulation optionnel (AbortController).
   * @returns Réponse axios contenant la session.
   */
  getById: (
    sessionId: Session["id"],
    signal?: AbortSignal,
  ): Promise<AxiosResponse<Session>> =>
    api.get<Session>(`/session/${sessionId}`, { signal }),

  /**
   * Supprime une session.
   *
   * @param sessionId - Identifiant de la session à supprimer.
   * @returns Réponse axios de la requête DELETE.
   */
  delete: (sessionId: Session["id"]): Promise<AxiosResponse> =>
    api.delete(`/session/${sessionId}`),

  /**
   * Inscrit un utilisateur à une session.
   *
   * @param sessionId - Identifiant de la session.
   * @param userId - Identifiant de l'utilisateur à inscrire.
   * @returns Réponse axios de la requête POST.
   */
  participate: (
    sessionId: Session["id"],
    userId: User["id"],
  ): Promise<AxiosResponse> =>
    api.post(`/session/${sessionId}/participate/${userId}`),

  /**
   * Désinscrit un utilisateur d'une session.
   *
   * @param sessionId - Identifiant de la session.
   * @param userId - Identifiant de l'utilisateur à désinscrire.
   * @returns Réponse axios de la requête DELETE.
   */
  unparticipate: (
    sessionId: Session["id"],
    userId: User["id"],
  ): Promise<AxiosResponse> =>
    api.delete(`/session/${sessionId}/participate/${userId}`),

  /**
   * Crée une nouvelle session.
   *
   * @param data - Données du formulaire de session.
   * @returns Réponse axios de la requête POST.
   */
  create: (data: SessionFormData): Promise<AxiosResponse<Session>> =>
    api.post<Session>("/session", data),

  /**
   * Met à jour une session existante.
   *
   * @param sessionId - Identifiant de la session à modifier.
   * @param data - Données du formulaire de session.
   * @returns Réponse axios de la requête PUT.
   */
  update: (
    sessionId: Session["id"],
    data: SessionFormData,
  ): Promise<AxiosResponse<Session>> =>
    api.put<Session>(`/session/${sessionId}`, data),
};
