import { User } from "@prisma/client";
import { BadRequestError, UnauthorizedError } from "../errors/http-error";
import { userRepository } from "../user/user.repository";
import { LoginDto, RegisterDto } from "./auth.dto";
import * as bcrypt from "bcrypt";
import { generateToken } from "../utils/jwt.util";

/**
 * Build the authentication payload: the public user fields plus a fresh JWT.
 *
 * @param user The authenticated user.
 * @returns The user profile and a signed `token`.
 */
const formatAuthResponse = (user: User) => ({
  id: user.id,
  email: user.email,
  firstName: user.firstName,
  lastName: user.lastName,
  admin: user.admin,
  token: generateToken(user.id),
});

export const authService = {
  /**
   * Authenticate a user from email and password.
   *
   * @param dto The login credentials.
   * @returns The user profile and a signed `token`.
   * @throws UnauthorizedError When the email is unknown or the password is wrong.
   */
  async login(dto: LoginDto) {
    const user = await userRepository.findByEmail(dto.email);
    if (!user) throw new UnauthorizedError("Invalid credentials");

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) throw new UnauthorizedError("Invalid credentials");

    return formatAuthResponse(user);
  },

  /**
   * Create a non-admin user account with a hashed password.
   *
   * @param dto The registration payload.
   * @returns The created user profile and a signed `token`.
   * @throws BadRequestError When the email is already registered.
   */
  async register(dto: RegisterDto) {
    const existingUser = await userRepository.findByEmail(dto.email);
    if (existingUser) throw new BadRequestError("Email already exists");

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await userRepository.create({
      ...dto,
      password: hashedPassword,
      admin: false,
    });
    return formatAuthResponse(user);
  },
};
