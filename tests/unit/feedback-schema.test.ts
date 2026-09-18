import { describe, expect, it } from "vitest";
import { feedbackSchema } from "@/lib/feedback-schema";

const valid = {
  name: "Jane",
  email: "jane@example.com",
  message: "Please add more compounds.",
  locale: "en" as const,
};

describe("feedbackSchema", () => {
  it("accepts a valid submission", () => {
    expect(feedbackSchema.safeParse(valid).success).toBe(true);
  });

  it("allows the name to be omitted or blank", () => {
    expect(feedbackSchema.safeParse({ ...valid, name: "" }).success).toBe(true);
    expect(feedbackSchema.safeParse({ ...valid, name: null }).success).toBe(true);
  });

  it("requires a valid email", () => {
    expect(feedbackSchema.safeParse({ ...valid, email: "nope" }).success).toBe(false);
    expect(feedbackSchema.safeParse({ ...valid, email: "" }).success).toBe(false);
  });

  it("requires a non-empty message", () => {
    expect(feedbackSchema.safeParse({ ...valid, message: "   " }).success).toBe(false);
  });
});
