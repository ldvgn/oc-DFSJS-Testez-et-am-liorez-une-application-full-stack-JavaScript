import { Teacher } from "@prisma/client";
import { teacherRepository } from "./teacher.repository";
import { NotFoundError } from "../errors/http-error";

/**
 * Map a teacher entity to the API response shape.
 *
 * @param teacher The teacher entity.
 * @returns A plain object with the public teacher fields.
 */
const formatTeacherResponse = (teacher: Teacher) => ({
  id: teacher.id,
  firstName: teacher.firstName,
  lastName: teacher.lastName,
  createdAt: teacher.createdAt,
  updatedAt: teacher.updatedAt,
});

export const teacherService = {
  /**
   * List every teacher, formatted for the API.
   *
   * @returns The array of formatted teachers, newest first.
   */
  async getAll() {
    const teachers = await teacherRepository.findAll();

    return teachers.map(formatTeacherResponse);
  },

  /**
   * Fetch a single teacher by id, formatted for the API.
   *
   * @param id The teacher id.
   * @returns The formatted teacher.
   * @throws NotFoundError When no teacher matches the id.
   */
  async getById(id: number) {
    const teacher = await teacherRepository.findOne(id);
    if (!teacher) throw new NotFoundError("Teacher not found");

    return formatTeacherResponse(teacher);
  },
};
