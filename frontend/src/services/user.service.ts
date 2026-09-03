import { AxiosResponse } from "axios";
import { User } from "../types";
import api from "./api";

export const userService = {
  /**
   * Fetches a user by id.
   *
   * @param userId - User id.
   * @param signal - Optional abort signal (AbortController).
   * @returns Axios response containing the user.
   */
  getById: (
    userId: User["id"],
    signal?: AbortSignal,
  ): Promise<AxiosResponse<User>> =>
    api.get<User>(`/user/${userId}`, { signal }),

  /**
   * Deletes a user.
   *
   * @param userId - Id of the user to delete.
   * @returns Axios response of the DELETE request.
   */
  delete: (userId: User["id"]): Promise<AxiosResponse> =>
    api.delete(`/user/${userId}`),

  /**
   * Promotes the user to admin.
   *
   * @returns Axios response containing the updated user.
   */
  promoteToAdmin: (): Promise<AxiosResponse<User>> =>
    api.post<User>("/user/promote-admin"),
};
