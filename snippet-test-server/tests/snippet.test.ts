import { describe, expect, it } from "vitest";
import { buildInitSnippet } from "../lib/snippet";

describe("snippet scaffolding", () => {
  it("exposes the init snippet builder", () => {
    expect(buildInitSnippet).toBeTypeOf("function");
  });
});
