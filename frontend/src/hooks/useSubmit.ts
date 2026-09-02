import { useState } from "react";
import axios from "axios";

/**
 * Enrobe une action asynchrone de formulaire :
 * - gère l'état `loading`
 * - l'état `error`
 * - empêche les soumissions multiples.
 *
 * @param fallbackError - Message affiché si l'erreur n'expose pas de message.
 * @returns `loading`, `error`, `submit` (lance l'action) et `setError`.
 */
export function useSubmit(fallbackError: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Exécute `action` en gérant loading/error.
   * Ignore l'appel si une soumission est déjà en cours.
   *
   * @param action - Traitement asynchrone à exécuter (appel API + navigation).
   */
  const submit = async (action: () => Promise<void>) => {
    if (loading) return;

    setError(null);
    setLoading(true);

    try {
      await action();
    } catch (err) {
      setError(
        axios.isAxiosError(err) && err.response?.data?.message
          ? err.response.data.message
          : fallbackError,
      );
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, submit, setError };
}
