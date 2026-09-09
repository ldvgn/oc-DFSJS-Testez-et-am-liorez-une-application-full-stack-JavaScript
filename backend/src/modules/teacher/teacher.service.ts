import { Teacher } from "@prisma/client";
import { teacherRepository, TeacherRepository } from "./teacher.repository";
import { NotFoundError } from "../../commons/errors/http-error";
import { TeacherResponse, TeacherResponseSchema } from "./teacher.dto";

/**
 * Business logic for the `teacher` domain.
 *
 * Owns the teacher repository and is the only layer that turns a missing row into a {@link NotFoundError}.
 */
export class TeacherService {
  constructor(private readonly repo = new TeacherRepository()) {}

  /**
   * List every teacher.
   *
   * @returns The array of formatted teachers, newest first.
   */
  async getAll(): Promise<TeacherResponse[]> {
    const teachers = await this.repo.findAll();

    return teachers.map((teacher) => this.toResponse(teacher));
  }

  /**
   * Fetch a single teacher by id.
   *
   * @param id The teacher id.
   * @returns The formatted teacher.
   */
  async getById(id: number): Promise<TeacherResponse> {
    const teacher = await this.getTeacherOrThrow(id);

    return this.toResponse(teacher);
  }

  /**
   * Load a teacher by id or fail.
   *
   * @param id The teacher id.
   * @returns The matching teacher.
   *
   * @throws {NotFoundError} When no teacher matches the id.
   */
  private async getTeacherOrThrow(id: number): Promise<Teacher> {
    const teacher = await this.repo.findOne(id);
    if (!teacher) throw new NotFoundError("Teacher not found");

    return teacher;
  }

  /**
   * Map a teacher entity to the API response shape.
   *
   * @param teacher The teacher entity.
   * @returns A plain object with the public teacher fields.
   */
  private toResponse(teacher: Teacher): TeacherResponse {
    return TeacherResponseSchema.parse(teacher);
  }
}
