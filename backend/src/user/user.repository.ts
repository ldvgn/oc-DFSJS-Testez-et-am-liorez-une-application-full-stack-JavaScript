import { Prisma } from "@prisma/client";
import prisma from "../prisma/client";

export const userRepository = {
  /**
   * Fetch a user by id.
   *
   * @param id The user id.
   * @returns A promise of the user, or `null` when not found.
   */
  findOne: (id: number) => prisma.user.findUnique({ where: { id } }),

  /**
   * Fetch a user by email.
   *
   * @param email The user email.
   * @returns A promise of the user, or `null` when not found.
   */
  findByEmail: (email: string) => prisma.user.findUnique({ where: { email } }),

  /**
   * Insert a user.
   *
   * @param data The user fields, including the already-hashed `password`.
   * @returns A promise of the created user.
   */
  create: (data: Prisma.UserUncheckedCreateInput) =>
    prisma.user.create({ data }),

  /**
   * Delete a user by id.
   *
   * @param id The user id.
   * @returns A promise of the deleted user.
   */
  delete: (id: number) => prisma.user.delete({ where: { id } }),

  /**
   * Set the `admin` flag on a user.
   *
   * @param id The user id.
   * @param admin The new value of the `admin` flag.
   * @returns A promise of the updated user.
   */
  updateAdmin: (id: number, admin: boolean) =>
    prisma.user.update({ where: { id }, data: { admin } }),
};
