import { z } from "zod";

/** Public representation of a teacher. */
export const TeacherResponseSchema = z.object({
  id: z.number(),
  firstName: z.string(),
  lastName: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type TeacherResponse = z.infer<typeof TeacherResponseSchema>;
