import { describe, expect, it } from "vitest";
import { ARTIFACTS, filterArtifacts } from "@/lib/artifacts";
import { QUIZ, scoreQuiz } from "@/lib/quiz";

describe("archive filters", () => {
  it("Moon filter returns the three lunar artifacts", () => {
    expect(filterArtifacts(ARTIFACTS, "", "moon").map((a) => a.id)).toEqual([
      "apollo-11-descent-stage",
      "lunar-roving-vehicle",
      "surveyor-3",
    ]);
  });
  it("Mars filter returns Sojourner and Spirit", () => {
    expect(filterArtifacts(ARTIFACTS, "", "mars").map((a) => a.id)).toEqual(["sojourner", "spirit"]);
  });
  it("search matches artifact names case-insensitively", () => {
    expect(filterArtifacts(ARTIFACTS, "SPIRIT", "all").map((a) => a.id)).toEqual(["spirit"]);
  });
  it("search with no match returns empty", () => {
    expect(filterArtifacts(ARTIFACTS, "voyager", "all")).toHaveLength(0);
  });
});

describe("quiz", () => {
  it("has between 5 and 10 questions", () => {
    expect(QUIZ.length).toBeGreaterThanOrEqual(5);
    expect(QUIZ.length).toBeLessThanOrEqual(10);
  });
  it("scores only correct answers", () => {
    const answers = QUIZ.map((q, i) => (i < 3 ? q.answer : (q.answer + 1) % q.options.length));
    expect(scoreQuiz(answers)).toBe(3);
  });
});
