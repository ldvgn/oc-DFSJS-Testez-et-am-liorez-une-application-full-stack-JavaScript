import { User } from "@prisma/client";
import { ForbiddenError, NotFoundError } from "../../commons/errors/http-error";
import { UserRepository } from "./user.repository";
import { UserResponse, UserResponseSchema } from "./user.dto";

/**
 * Business logic for the `user` domain.
 *
 * Owns the user repository and is the only layer that turns a missing row into a {@link NotFoundError}.
 */
export class UserService {
  constructor(private readonly userRepo = new UserRepository()) {}

  /**
   * Fetch a single user by id.
   *
   * @param id The user id.
   * @returns The formatted user.
   *
   * @throws {NotFoundError} When no user matches the id.
   */
  async getById(id: number): Promise<UserResponse> {
    const user = await this.getUserOrThrow(id);
    return this.toResponse(user);
  }

  /**
   * Delete a user account.
   *
   * @param id The user id.
   *
   * @throws {NotFoundError} When the account does not exist.
   */
  async remove(id: number): Promise<void> {
    await this.getUserOrThrow(id);
    await this.userRepo.delete(id);
  }

  /**
   * Grant admin rights to the calling user. Development environment only.
   *
   * @param userId The user id.
   * @returns The formatted user, now an admin.
   *
   * @throws {ForbiddenError} When `NODE_ENV` is not `development`.
   * @throws {NotFoundError} When the user does not exist.
   */
  async promoteSelfToAdmin(userId: number): Promise<UserResponse> {
    const isDev = (process.env.NODE_ENV || "development") === "development";
    if (!isDev)
      throw new ForbiddenError(
        "Admin self-promotion is only available in development",
      );

    const user = await this.getUserOrThrow(userId);
    if (user.admin) return this.toResponse(user);

    const updatedUser = await this.userRepo.updateAdmin(userId, true);

    return this.toResponse(updatedUser);
  }

  /**
   * Load a user by id and assert admin privileges.
   *
   * @param id The user id.
   * @returns The admin user entity.
   *
   * @throws {ForbiddenError} When the user is missing or not an admin.
   */
  async getAdminOrThrow(id: number): Promise<User> {
    const user = await this.userRepo.findOne(id);
    if (!user || !user.admin) throw new ForbiddenError("Admin access required");

    return user;
  }

  /**
   * Load a user by id or fail.
   *
   * @param id The user id.
   * @returns The matching user.
   *
   * @throws {NotFoundError} When no user matches the id.
   */
  async getUserOrThrow(id: number): Promise<User> {
    const user = await this.userRepo.findOne(id);
    if (!user) throw new NotFoundError("User not found");

    return user;
  }

  /**
   * Map a user entity to the API response shape (password excluded).
   *
   * @param user The user entity.
   * @returns A plain object with the public user fields.
   */
  private toResponse(user: User): UserResponse {
    return UserResponseSchema.parse(user);
  }
}
