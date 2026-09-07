import prisma from "../prisma/client";

export const teacherRepository = {
  /**
   * Fetch a teacher by id.
   *
   * @param id The teacher id.
   * @returns A promise of the teacher, or `null` when not found.
   */
  findOne: (id: number) => prisma.teacher.findUnique({ where: { id } }),
};
