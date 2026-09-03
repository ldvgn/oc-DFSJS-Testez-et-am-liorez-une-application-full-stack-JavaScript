import { AxiosResponse } from "axios";
import { Session, SessionFormData, User } from "../types";
import api from "./api";

export const sessionService = {
  /**
   * Fetches all sessions.
   *
   * @param signal - Optional abort signal (AbortController).
   * @returns Axios response containing the array of sessions.
   */
  getAll: (signal?: AbortSignal): Promise<AxiosResponse<Session[]>> =>
    api.get<Session[]>("/session", { signal }),

  /**
   * Fetches a session by id.
   *
   * @param sessionId - Session id.
   * @param signal - Optional abort signal (AbortController).
   * @returns Axios response containing the session.
   */
  getById: (
    sessionId: Session["id"],
    signal?: AbortSignal,
  ): Promise<AxiosResponse<Session>> =>
    api.get<Session>(`/session/${sessionId}`, { signal }),

  /**
   * Deletes a session.
   *
   * @param sessionId - Id of the session to delete.
   * @returns Axios response of the DELETE request.
   */
  delete: (sessionId: Session["id"]): Promise<AxiosResponse> =>
    api.delete(`/session/${sessionId}`),

  /**
   * Registers a user for a session.
   *
   * @param sessionId - Session id.
   * @param userId - Id of the user to register.
   * @returns Axios response of the POST request.
   */
  participate: (
    sessionId: Session["id"],
    userId: User["id"],
  ): Promise<AxiosResponse> =>
    api.post(`/session/${sessionId}/participate/${userId}`),

  /**
   * Unregisters a user from a session.
   *
   * @param sessionId - Session id.
   * @param userId - Id of the user to unregister.
   * @returns Axios response of the DELETE request.
   */
  unparticipate: (
    sessionId: Session["id"],
    userId: User["id"],
  ): Promise<AxiosResponse> =>
    api.delete(`/session/${sessionId}/participate/${userId}`),

  /**
   * Creates a new session.
   *
   * @param data - Session form data.
   * @returns Axios response of the POST request.
   */
  create: (data: SessionFormData): Promise<AxiosResponse<Session>> =>
    api.post<Session>("/session", data),

  /**
   * Updates an existing session.
   *
   * @param sessionId - Id of the session to update.
   * @param data - Session form data.
   * @returns Axios response of the PUT request.
   */
  update: (
    sessionId: Session["id"],
    data: SessionFormData,
  ): Promise<AxiosResponse<Session>> =>
    api.put<Session>(`/session/${sessionId}`, data),
};
