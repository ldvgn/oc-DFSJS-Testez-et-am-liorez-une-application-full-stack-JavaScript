import { useEffect, useRef, useState } from "react";
import { User } from "../types";
import { userService } from "../services/user.service";
import axios from "axios";
import { authService } from "../services/auth.service";

/**
 * Loads a user's information by id.
 *
 * @param id - User id
 * @returns
 * - User state (`userInfo`, `loading`, `error`)
 * - `deleteUser` and `promoteToAdmin` actions.
 */
export function useUserInfo(id: User["id"]) {
  const [userInfo, setUserInfo] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  /**
   * Fetches the profile and cancels any previous request in flight.
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
   * Reloads the profile whenever `id` changes and cancels the request on unmount.
   */
  useEffect(() => {
    fetchUserInfo();
    return () => controllerRef.current?.abort();
  }, [id]);

  /**
   * Deletes the current user.
   *
   * @returns A promise resolved once the deletion is done.
   */
  const deleteUser = async () => {
    await userService.delete(id);
  };

  /**
   * Promotes the user to admin, then updates local state and the current
   * user stored client-side.
   *
   * @returns A promise resolved once the state is updated.
   */
  const promoteToAdmin = async () => {
    const response = await userService.promoteToAdmin();
    setUserInfo(response.data);
    authService.updateCurrentUser({ admin: response.data.admin });
  };

  return { userInfo, loading, error, deleteUser, promoteToAdmin };
}
