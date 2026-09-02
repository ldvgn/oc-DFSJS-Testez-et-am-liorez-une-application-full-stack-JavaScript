import { Teacher } from "../types";
import api from "./api";

export const teacherService = {
  /**
   * Récupère la liste des enseignants.
   * @param signal - Signal d'annulation optionnel (AbortController).
   * @returns Réponse axios contenant le tableau des enseignants.
   */
  getAll: (signal?: AbortSignal) => api.get<Teacher[]>("/teacher", { signal }),
};
