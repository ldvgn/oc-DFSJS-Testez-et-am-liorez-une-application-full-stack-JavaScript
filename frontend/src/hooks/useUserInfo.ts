import { useEffect, useRef, useState } from "react";
import { User } from "../types";
import { userService } from "../services/user.service";
import axios from "axios";
import { authService } from "../services/auth.service";

/**
 * Charge les informations d'un utilisateur par son identifiant.
 *
 * @param id - Identifiant de l'utilisateur
 * @returns
 * - L'état de l'utilisateur (`userInfo`, `loading`, `error`)
 * - les actions `deleteUser` et `promoteToAdmin`.
 */
export function useUserInfo(id: User["id"]) {
  const [userInfo, setUserInfo] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  /**
   * Récupère le profil et annule toute requête précédente en cours.
   */
  const fetchUserInfo = async () => {
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
      const response = await userService.getById(id, controller.signal);
      if (!controller.signal.aborted) setUserInfo(response.data);
    } catch (err) {
      if (!axios.isCancel(err)) setError("Failed to load user information");
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  };

  /**
   * Recharge le profil à chaque changement d'`id` et annule la requête au démontage.
   */
  useEffect(() => {
    fetchUserInfo();
    return () => controllerRef.current?.abort();
  }, [id]);

  /**
   * Supprime l'utilisateur courant.
   *
   * @returns Une promesse résolue une fois la suppression effectuée.
   */
  const deleteUser = async () => {
    await userService.delete(id);
  };

  /**
   * Promeut l'utilisateur au rôle d'administrateur puis met à jour l'état local
   * et l'utilisateur courant stocké côté client.
   *
   * @returns Une promesse résolue une fois l'état mis à jour.
   */
  const promoteToAdmin = async () => {
    const response = await userService.promoteToAdmin();
    setUserInfo(response.data);
    authService.updateCurrentUser({ admin: response.data.admin });
  };

  return { userInfo, loading, error, deleteUser, promoteToAdmin };
}
