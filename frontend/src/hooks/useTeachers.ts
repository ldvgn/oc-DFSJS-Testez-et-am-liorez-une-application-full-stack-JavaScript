import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Teacher } from "../types";
import { teacherService } from "../services/teacher.service";

/**
 * Charge la liste des enseignants au montage.
 *
 * @returns `teachers` (liste), `loading`, `error`.
 */
export function useTeachers() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  /**
   * Récupère la liste des enseignants et annule toute requête précédente.
   */
  const fetchTeachers = async () => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    try {
      setLoading(true);
      setError(null);

      const response = await teacherService.getAll(controller.signal);
      if (!controller.signal.aborted) setTeachers(response.data);
    } catch (err) {
      if (!axios.isCancel(err)) setError("Failed to load teachers");
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  };

  /**
   * Charge les enseignants au montage et annule la requête au démontage.
   */
  useEffect(() => {
    fetchTeachers();
    return () => controllerRef.current?.abort();
  }, []);

  return { teachers, loading, error };
}
