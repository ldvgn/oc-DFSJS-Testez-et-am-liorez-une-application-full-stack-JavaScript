import prisma from "../prisma/client";

export const userRepository = {
  /**
   * Fetch a user by id.
   *
   * @param id The user id.
   * @returns A promise of the user, or `null` when not found.
   */
  findOne: (id: number) => prisma.user.findUnique({ where: { id } }),
};
