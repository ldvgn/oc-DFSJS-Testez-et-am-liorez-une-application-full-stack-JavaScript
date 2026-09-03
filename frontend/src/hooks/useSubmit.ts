import { useState } from "react";
import axios from "axios";
import { logger } from "../utils/logger";

/**
 * Wraps an async form action:
 * - manages `loading` state
 * - manages `error` state
 * - prevents multiple submissions.
 *
 * @param fallbackError - Message shown when the error doesn't expose a message.
 * @returns `loading`, `error`, `submit` (runs the action), and `setError`.
 */
export function useSubmit(fallbackError: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Runs `action` while managing loading/error state.
   * Ignores the call if a submission is already in progress.
   *
   * @param action - Async work to run (API call + navigation).
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
      logger.error(fallbackError, err);
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, submit, setError };
}
