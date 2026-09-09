import { Teacher } from "@prisma/client";
import prisma from "../../commons/prisma/client";

/**
 * Persistence layer for teachers, backed by Prisma.
 *
 * The only place the `teacher` table is queried; services depend on this class, never on Prisma directly.
 */
export class TeacherRepository {
  /**
   * Fetch every teacher, ordered by creation date descending.
   *
   * @returns A promise of the teacher list.
   */
  findAll(): Promise<Teacher[]> {
    return prisma.teacher.findMany({ orderBy: { createdAt: "desc" } });
  }

  /**
   * Fetch a teacher by id.
   *
   * @param id The teacher id.
   * @returns A promise of the teacher, or `null` when not found.
   */
  findOne(id: number): Promise<Teacher | null> {
    return prisma.teacher.findUnique({ where: { id } });
  }
}
