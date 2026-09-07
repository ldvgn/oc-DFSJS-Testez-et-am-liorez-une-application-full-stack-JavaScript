import prisma from "../prisma/client";

export const teacherRepository = {
  /**
   * Fetch every teacher, ordered by creation date descending.
   *
   * @returns A promise of the teacher list.
   */
  findAll: () =>
    prisma.teacher.findMany({
      orderBy: {
        createdAt: "desc",
      },
    }),

  /**
   * Fetch a teacher by id.
   *
   * @param id The teacher id.
   * @returns A promise of the teacher, or `null` when not found.
   */
  findOne: (id: number) => prisma.teacher.findUnique({ where: { id } }),
};
