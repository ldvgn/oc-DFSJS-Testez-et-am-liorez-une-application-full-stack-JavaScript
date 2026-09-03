import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Teacher } from "../types";
import { teacherService } from "../services/teacher.service";

/**
 * Loads the list of teachers on mount.
 *
 * @returns `teachers` (list), `loading`, `error`.
 */
export function useTeachers() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  /**
   * Fetches the list of teachers and cancels any previous request.
   */
  const fetchTeachers = async () => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const response = await teacherService.getAll(controller.signal);
      if (!controller.signal.aborted) setTeachers(response.data);
    } catch (err) {
      if (!axios.isCancel(err)) setError("Failed to load teachers");
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  };

  /**
   * Loads teachers on mount and cancels the request on unmount.
   */
  useEffect(() => {
    fetchTeachers();
    return () => controllerRef.current?.abort();
  }, []);

  return { teachers, loading, error };
}
