import { Prisma } from "@prisma/client";
import prisma from "../../commons/prisma/client";

export const sessionRepository = {
  /**
   * Fetch every session with its teacher and participants.
   *
   * @returns A promise of the session list.
   */
  findAll: () =>
    prisma.session.findMany({
      include: {
        teacher: true,
        participants: {
          include: {
            user: true,
          },
        },
      },
    }),

  /**
   * Fetch a session by id with its teacher and participants.
   *
   * @param id The session id.
   * @returns A promise of the session, or `null` when not found.
   */
  findOne: (id: number) =>
    prisma.session.findUnique({
      where: { id: id },
      include: {
        teacher: true,
        participants: {
          include: {
            user: true,
          },
        },
      },
    }),

  /**
   * Insert a session.
   *
   * @param data The session fields, including `teacherId`.
   * @returns A promise of the created session with its relations.
   */
  create: (data: Prisma.SessionUncheckedCreateInput) =>
    prisma.session.create({
      data,
      include: {
        teacher: true,
        participants: {
          include: {
            user: true,
          },
        },
      },
    }),

  /**
   * Update a session by id.
   *
   * @param id The session id.
   * @param data The fields to change.
   * @returns A promise of the updated session with its relations.
   */
  update: (id: number, data: Prisma.SessionUncheckedUpdateInput) =>
    prisma.session.update({
      where: { id },
      data,
      include: {
        teacher: true,
        participants: {
          include: {
            user: true,
          },
        },
      },
    }),

  /**
   * Delete a session by id.
   *
   * @param id The session id.
   * @returns A promise of the deleted session.
   */
  delete: (id: number) => prisma.session.delete({ where: { id } }),

  /**
   * Look up a user's participation in a session.
   *
   * @param sessionId The session id.
   * @param userId The user id.
   * @returns A promise of the participation, or `null` when absent.
   */
  findParticipation: (sessionId: number, userId: number) =>
    prisma.sessionParticipation.findUnique({
      where: { sessionId_userId: { sessionId, userId } },
    }),

  /**
   * Create a participation linking a user to a session.
   *
   * @param sessionId The session id.
   * @param userId The user id.
   * @returns A promise of the created participation.
   */
  addParticipation: (sessionId: number, userId: number) =>
    prisma.sessionParticipation.create({ data: { sessionId, userId } }),

  /**
   * Remove a user's participation in a session.
   *
   * @param sessionId The session id.
   * @param userId The user id.
   * @returns A promise of the deleted participation.
   */
  deleteParticipation: (sessionId: number, userId: number) =>
    prisma.sessionParticipation.delete({
      where: { sessionId_userId: { sessionId, userId } },
    }),
};
