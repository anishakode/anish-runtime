import { describe, expect, it, vi } from "vitest";
import {
  buildIssueBody,
  LABEL,
  MAX_OUTPUT_CHARS,
  reportProvenanceFailure,
  TITLE,
} from "./provenance-issue.mjs";

type CreateArgs = {
  owner: string;
  repo: string;
  title: string;
  labels: string[];
  body: string;
};

type ListArgs = { owner: string; repo: string; state: string; labels: string };

function harness(openIssues: { title: string }[] = []) {
  const create = vi.fn<(args: CreateArgs) => Promise<object>>().mockResolvedValue({});
  const listForRepo = vi
    .fn<(args: ListArgs) => Promise<{ data: { title: string }[] }>>()
    .mockResolvedValue({ data: openIssues });
  return {
    create,
    listForRepo,
    /** The first issue this filed, or a clear failure if it filed none. */
    created(): CreateArgs {
      const call = create.mock.calls[0];
      expect(call, "no issue was filed").toBeDefined();
      return call![0];
    },
    github: { rest: { issues: { listForRepo, create } } },
    context: {
      repo: { owner: "anishakode", repo: "anish-runtime" },
      serverUrl: "https://github.com",
      runId: 12345,
    },
  };
}

/**
 * This code path only runs when the proof trail is already broken, so a passing
 * weekly schedule never exercises it. These tests are the only thing standing
 * between a provenance failure and silence.
 */
describe("provenance issue filing (M27)", () => {
  it("opens an issue when nothing is tracking the breakage", async () => {
    const h = harness([]);
    const result = await reportProvenanceFailure({
      github: h.github,
      context: h.context,
      readOutput: () => "X src.mlops.repo   HTTP 404",
    });

    expect(result).toBe("created");
    expect(h.create).toHaveBeenCalledTimes(1);

    const arg = h.created();
    expect(arg.owner).toBe("anishakode");
    expect(arg.repo).toBe("anish-runtime");
    expect(arg.title).toBe(TITLE);
    expect(arg.labels).toEqual([LABEL]);
    expect(arg.body).toContain("X src.mlops.repo   HTTP 404");
    expect(arg.body).toContain(
      "https://github.com/anishakode/anish-runtime/actions/runs/12345",
    );
  });

  it("does not stack a second issue on the same open breakage", async () => {
    // The schedule is weekly, so without this the owner accrues one identical
    // issue every week until they fix it.
    const h = harness([{ title: TITLE }]);
    const result = await reportProvenanceFailure({
      github: h.github,
      context: h.context,
      readOutput: () => "X src.mlops.repo   HTTP 404",
    });

    expect(result).toBe("already-open");
    expect(h.create).not.toHaveBeenCalled();
  });

  it("only counts open issues, so a closed one cannot suppress a new failure", async () => {
    const h = harness([]);
    await reportProvenanceFailure({
      github: h.github,
      context: h.context,
      readOutput: () => "X src.steward.readme   HTTP 404",
    });

    expect(h.listForRepo).toHaveBeenCalledWith({
      owner: "anishakode",
      repo: "anish-runtime",
      state: "open",
      labels: LABEL,
    });
    expect(h.create).toHaveBeenCalledTimes(1);
  });

  it("is not fooled by an unrelated open issue carrying the same label", async () => {
    const h = harness([{ title: "Something else entirely" }]);
    const result = await reportProvenanceFailure({
      github: h.github,
      context: h.context,
      readOutput: () => "X src.mlops.repo   HTTP 404",
    });

    expect(result).toBe("created");
    expect(h.create).toHaveBeenCalledTimes(1);
  });

  it("still files the issue when the log cannot be read", async () => {
    // The failure is the point; the log is only the detail. Losing the file
    // must not turn a broken proof trail into silence.
    const h = harness([]);
    const result = await reportProvenanceFailure({
      github: h.github,
      context: h.context,
      readOutput: () => {
        throw new Error("ENOENT: no such file");
      },
    });

    expect(result).toBe("created");
    expect(h.created().body).toContain("(no output captured)");
    expect(h.created().body).not.toContain("ENOENT");
  });

  it("treats an empty log the same as a missing one", async () => {
    const h = harness([]);
    await reportProvenanceFailure({
      github: h.github,
      context: h.context,
      readOutput: () => "   \n  ",
    });
    expect(h.created().body).toContain("(no output captured)");
  });

  it("keeps the tail of an oversized log, where the failures are", async () => {
    const h = harness([]);
    const long = "filler\n".repeat(5000) + "X src.last   HTTP 404";
    expect(long.length).toBeGreaterThan(MAX_OUTPUT_CHARS);

    await reportProvenanceFailure({
      github: h.github,
      context: h.context,
      readOutput: () => long,
    });

    const body = h.created().body;
    expect(body).toContain("X src.last   HTTP 404");
    expect(body.length).toBeLessThan(MAX_OUTPUT_CHARS + 1000);
  });

  it("tells the owner what to do, and rules out the tempting wrong fix", () => {
    const body = buildIssueBody("X src.a   HTTP 404", "https://example.test/run");
    expect(body).toMatch(/re-pin the source through change control/i);
    expect(body).toMatch(/Do not silently drop the link/i);
    expect(body).toContain("https://example.test/run");
  });
});
