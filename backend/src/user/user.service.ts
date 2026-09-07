import { User } from "@prisma/client";
import { NotFoundError } from "../errors/http-error";
import { userRepository } from "./user.repository";

/**
 * Map a user entity to the API response shape (password excluded).
 *
 * @param user The user entity.
 * @returns A plain object with the public user fields.
 */
const formatUserResponse = (user: User) => ({
  id: user.id,
  email: user.email,
  firstName: user.firstName,
  lastName: user.lastName,
  admin: user.admin,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

export const userService = {
  /**
   * Fetch a single user by id, formatted for the API.
   *
   * @param id The user id.
   * @returns The formatted user.
   * @throws NotFoundError When no user matches the id.
   */
  async getById(id: number) {
    const user = await userRepository.findOne(id);
    if (!user) throw new NotFoundError("User not found");

    return formatUserResponse(user);
  },

  /**
   * Delete a user by id.
   *
   * @param id The user id.
   * @throws NotFoundError When no user matches the id.
   */
  async delete(id: number) {
    const user = await userRepository.findOne(id);
    if (!user) throw new NotFoundError("User not found");

    await userRepository.delete(id);
  },

  /**
   * Grant admin rights to a user; no-op if they are already an admin.
   *
   * @param id The user id.
   * @returns The formatted user, now an admin.
   * @throws NotFoundError When no user matches the id.
   */
  async promoteToAdmin(id: number) {
    const user = await userRepository.findOne(id);
    if (!user) throw new NotFoundError("User not found");
    if (user.admin) return formatUserResponse(user);

    const updated = await userRepository.updateAdmin(id, true);
    return formatUserResponse(updated);
  },
};
