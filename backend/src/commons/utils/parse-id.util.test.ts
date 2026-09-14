import { describe, it, expect } from "vitest";
import { parseId } from "./parse-id.util";
import { BadRequestError } from "../errors/http-error";

describe("parseId", () => {
  it("returns the parsed integer for a valid numeric string", () => {
    expect(parseId("42", "Invalid ID")).toBe(42);
  });

  it("throws BadRequestError for zero", () => {
    expect(() => parseId("0", "Invalid ID")).toThrow(BadRequestError);
  });

  it("throws BadRequestError for a negative number", () => {
    expect(() => parseId("-1", "Invalid ID")).toThrow(BadRequestError);
  });

  it("throws BadRequestError for a non-numeric string", () => {
    expect(() => parseId("abc", "Invalid ID")).toThrow(BadRequestError);
  });
});
