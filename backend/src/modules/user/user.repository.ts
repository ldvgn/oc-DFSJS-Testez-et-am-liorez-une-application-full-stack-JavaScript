import { Prisma, User } from "@prisma/client";
import prisma from "../../commons/prisma/client";

/**
 * Persistence layer for users, backed by Prisma.
 *
 * The only place the `user` table is queried; services depend on this class, never on Prisma directly.
 */
export class UserRepository {
  /**
   * Fetch a user by id.
   *
   * @param id The user id.
   * @returns A promise of the user, or `null` when not found.
   */
  findOne(id: number): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  }

  /**
   * Fetch a user by email.
   *
   * @param email The user email.
   * @returns A promise of the user, or `null` when not found.
   */
  findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  }

  /**
   * Insert a new user.
   *
   * @param data The user fields, including the already-hashed `password`.
   * @returns A promise of the created user.
   */
  create(data: Prisma.UserUncheckedCreateInput): Promise<User> {
    return prisma.user.create({ data });
  }

  /**
   * Delete a user by id.
   *
   * @param id The user id.
   * @returns A promise of the deleted user.
   */
  delete(id: number): Promise<User> {
    return prisma.user.delete({ where: { id } });
  }

  /**
   * Set the `admin` flag on a user.
   *
   * @param id The user id.
   * @param admin The new value of the `admin` flag.
   * @returns A promise of the updated user.
   */
  updateAdmin(id: number, admin: boolean): Promise<User> {
    return prisma.user.update({ where: { id }, data: { admin } });
  }
}
