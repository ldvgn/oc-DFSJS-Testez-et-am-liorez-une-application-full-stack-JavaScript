import { z } from "zod";

/** Public representation of a user (never includes `password`). */
export const UserResponseSchema = z.object({
  id: z.number(),
  email: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  admin: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type UserResponse = z.infer<typeof UserResponseSchema>;
