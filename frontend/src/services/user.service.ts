import { AxiosResponse } from "axios";
import { User } from "../types";
import api from "./api";

export const userService = {
  /**
   * Récupère un utilisateur par son identifiant.
   *
   * @param userId - Identifiant de l'utilisateur.
   * @param signal - Signal d'annulation optionnel (AbortController).
   * @returns Réponse axios contenant l'utilisateur.
   */
  getById: (
    userId: User["id"],
    signal?: AbortSignal,
  ): Promise<AxiosResponse<User>> =>
    api.get<User>(`/user/${userId}`, { signal }),

  /**
   * Supprime un utilisateur.
   *
   * @param userId - Identifiant de l'utilisateur à supprimer.
   * @returns Réponse axios de la requête DELETE.
   */
  delete: (userId: User["id"]): Promise<AxiosResponse> =>
    api.delete(`/user/${userId}`),

  /**
   * Promeut l'utilisateur au rôle d'administrateur.
   *
   * @returns Réponse axios contenant l'utilisateur mis à jour.
   */
  promoteToAdmin: (): Promise<AxiosResponse<User>> =>
    api.post<User>("/user/promote-admin"),
};
