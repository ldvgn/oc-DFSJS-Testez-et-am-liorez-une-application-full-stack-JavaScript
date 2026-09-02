import { useEffect, useRef, useState } from "react";
import { Session, User } from "../types";
import { sessionService } from "../services/session.service";
import axios from "axios";

/**
 * Charge et gère une session par son identifiant.
 *
 * @param id - Identifiant de la session
 * @returns
 * - L'état de la session (`session`, `loading`, `error`)
 * - les actions `fetchSession`, `participate`, `unparticipate` et `deleteSession`.
 */
export function useSession(id: Session["id"]) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(!Number.isNaN(id));
  const [error, setError] = useState<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  /**
   * Récupère la session courante et annule toute requête précédente en cours.
   *
   * @returns Une promesse résolue une fois l'état mis à jour.
   */
  const fetchSession = async () => {
    if (!id || Number.isNaN(id)) {
      setLoading(false);
      return;
    }

    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    try {
      setLoading(true);
      setError(null);

      const response = await sessionService.getById(id, controller.signal);
      if (!controller.signal.aborted) setSession(response.data);
    } catch (err) {
      if (!axios.isCancel(err)) setError("Failed to load session details");
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  };

  /**
   * Recharge la session à chaque changement d'`id` et annule la requête au démontage.
   */
  useEffect(() => {
    fetchSession();
    return () => controllerRef.current?.abort();
  }, [id]);

  /**
   * Inscrit un utilisateur à la session puis rafraîchit les données.
   *
   * @param userId - Identifiant de l'utilisateur à inscrire.
   * @returns Une promesse résolue après le rechargement de la session.
   */
  const participate = async (userId: User["id"]) => {
    await sessionService.participate(id, userId);
    await fetchSession();
  };

  /**
   * Désinscrit un utilisateur de la session puis rafraîchit les données.
   *
   * @param userId - Identifiant de l'utilisateur à désinscrire.
   * @returns Une promesse résolue après le rechargement de la session.
   */
  const unparticipate = async (userId: User["id"]) => {
    await sessionService.unparticipate(id, userId);
    await fetchSession();
  };

  /**
   * Supprime la session courante.
   *
   * @returns Une promesse résolue une fois la suppression effectuée.
   */
  const deleteSession = async () => {
    await sessionService.delete(id);
  };

  return {
    session,
    loading,
    error,
    fetchSession,
    participate,
    unparticipate,
    deleteSession,
  };
}
