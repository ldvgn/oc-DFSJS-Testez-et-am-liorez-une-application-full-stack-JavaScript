import { BadRequestError } from "../errors/http-error";

export const parseId = (value: unknown, message: string): number => {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    throw new BadRequestError(message);
  }
  return id;
};
