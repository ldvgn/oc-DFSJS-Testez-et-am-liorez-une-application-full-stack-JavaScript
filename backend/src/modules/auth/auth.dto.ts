import { z } from "zod";
import { UserResponseSchema } from "../user/user.dto";

export const LoginSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

export const RegisterSchema = z.object({
  email: z.email(),
  firstName: z.string().min(2).max(20),
  lastName: z.string().min(2).max(20),
  password: z.string().min(8),
});

export const AuthResponseSchema = UserResponseSchema.pick({
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  admin: true,
}).extend({ token: z.string() });

export type LoginDto = z.infer<typeof LoginSchema>;
export type RegisterDto = z.infer<typeof RegisterSchema>;
export type AuthResponse = z.infer<typeof AuthResponseSchema>;
