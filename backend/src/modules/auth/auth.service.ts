import { User } from "@prisma/client";
import {
  BadRequestError,
  UnauthorizedError,
} from "../../commons/errors/http-error";
import { UserRepository } from "../user/user.repository";
import {
  AuthResponse,
  AuthResponseSchema,
  LoginDto,
  RegisterDto,
} from "./auth.dto";
import * as bcrypt from "bcrypt";
import { generateToken } from "../../commons/utils/jwt.util";

export class AuthService {
  constructor(private readonly userRepo = new UserRepository()) {}

  /**
   * Authenticate a user from email and password.
   *
   * @param dto The login credentials.
   * @returns The public user fields and a signed `token`.
   *
   * @throws {UnauthorizedError} When the email is unknown or the password is wrong.
   */
  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.userRepo.findByEmail(dto.email);
    if (!user) throw new UnauthorizedError("Invalid credentials");

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) throw new UnauthorizedError("Invalid credentials");

    return this.toResponse(user);
  }

  /**
   * Create a non-admin user account with a hashed password.
   *
   * @param dto The registration payload.
   * @returns The public user fields and a signed `token`.
   *
   * @throws {BadRequestError} When the email is already registered.
   */
  async register(dto: RegisterDto): Promise<AuthResponse> {
    const existingUser = await this.userRepo.findByEmail(dto.email);
    if (existingUser) throw new BadRequestError("Email already exists");

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.userRepo.create({
      ...dto,
      password: hashedPassword,
      admin: false,
    });

    return this.toResponse(user);
  }

  /**
   * Build the authentication payload: public user fields plus a fresh JWT.
   *
   * @param user The authenticated user entity.
   * @returns The public user fields and a signed `token`.
   */
  private toResponse(user: User): AuthResponse {
    return AuthResponseSchema.parse({
      ...user,
      token: generateToken(user.id),
    });
  }
}
