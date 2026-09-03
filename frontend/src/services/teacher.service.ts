import { AxiosResponse } from "axios";
import { Teacher } from "../types";
import api from "./api";

export const teacherService = {
  /**
   * Fetches the list of teachers.
   * @param signal - Optional abort signal (AbortController).
   * @returns Axios response containing the array of teachers.
   */
  getAll: (signal?: AbortSignal): Promise<AxiosResponse<Teacher[]>> =>
    api.get<Teacher[]>("/teacher", { signal }),
};
