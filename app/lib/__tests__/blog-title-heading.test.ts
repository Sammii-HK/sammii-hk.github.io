import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { describe, it, expect } from "vitest";
import { stripTitleHeading } from "../blog";

describe("stripTitleHeading", () => {
  it("drops a leading H1 that repeats the title", () => {
    expect(stripTitleHeading("# A love letter to Futura\n\nFutura does something.\n", "A love letter to Futura")).toBe(
      "Futura does something.\n",
    );
  });

  it("drops a thematic break straight after the dropped H1", () => {
    const body = "\n# What is consciousness?\n\n---\n\nMy MA research question was.\n";
    expect(stripTitleHeading(body, "What is consciousness?")).toBe("My MA research question was.\n");
  });

  it("matches on words, not punctuation or case", () => {
    expect(stripTitleHeading("# Saturn takes two and a half years. That changes everything\n\nBody", "Saturn takes two and a half years. That changes everything.")).toBe("Body");
  });

  it("leaves a different opening heading alone", () => {
    const body = "# Some other heading\n\nBody\n";
    expect(stripTitleHeading(body, "The title")).toBe(body);
  });

  it("leaves H2s, later H1s and plain openings alone", () => {
    expect(stripTitleHeading("## The title\n\nBody", "The title")).toBe("## The title\n\nBody");
    expect(stripTitleHeading("Intro.\n\n# The title\n", "The title")).toBe("Intro.\n\n# The title\n");
    expect(stripTitleHeading("---\n\nBody", "The title")).toBe("---\n\nBody");
  });

  it("keeps a rule that does not follow a dropped H1", () => {
    expect(stripTitleHeading("# The title\n\nBody\n\n---\n\nMore", "The title")).toBe("Body\n\n---\n\nMore");
  });

  it("leaves no post in content/blog opening with a second H1", () => {
    const dir = path.join(process.cwd(), "content/blog");
    const offenders = fs
      .readdirSync(dir)
      .filter((f) => f.endsWith(".md"))
      .filter((f) => {
        const { data, content } = matter(fs.readFileSync(path.join(dir, f), "utf-8"));
        return /^\s*#\s/.test(stripTitleHeading(content, String(data.title ?? "")));
      });
    expect(offenders).toEqual([]);
  });
});
