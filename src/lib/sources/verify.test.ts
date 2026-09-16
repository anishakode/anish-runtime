import { describe, expect, it } from "vitest";
import { getGraph } from "@/lib/evidence/queries";
import {
  URL_EXEMPT_SOURCE_TYPES,
  urlMatchesPin,
  verifySources,
  type EvidenceSource,
  type HeadFetcher,
} from "./verify";

const SHA = "a2ba6fc45aaece5c3241569271bcca77124da2b4";

function source(over: Partial<EvidenceSource> = {}): EvidenceSource {
  return {
    id: "src.test",
    type: "github_file",
    title: "A pinned file",
    fingerprint: "f".repeat(64),
    commitSha: SHA,
    url: `https://github.com/anishakode/repo/blob/${SHA}/app/main.py`,
    ...over,
  } as EvidenceSource;
}

const reachable: HeadFetcher = async () => ({ ok: true, status: 200 });

describe("source reachability (M27)", () => {
  it("passes a pinned source that still resolves", async () => {
    const result = await verifySources([source()], reachable);
    expect(result.failures).toEqual([]);
    expect(result.checked).toBe(1);
    expect(result.checks[0].status).toBe("reachable");
  });

  it("fails a moved path — the pin is intact but the file is gone", async () => {
    const notFound: HeadFetcher = async () => ({ ok: false, status: 404 });
    const result = await verifySources([source()], notFound);

    expect(result.failures).toHaveLength(1);
    expect(result.failures[0].id).toBe("src.test");
    expect(result.failures[0].status).toBe("unreachable");
    expect(result.failures[0].detail).toBe("HTTP 404");
  });

  it("fails a renamed repository", async () => {
    const gone: HeadFetcher = async () => ({ ok: false, status: 301 });
    const result = await verifySources(
      [source({ id: "src.repo", type: "github_repo" })],
      gone,
    );
    expect(result.failures.map((f) => f.id)).toEqual(["src.repo"]);
  });

  it("treats an unreachable host as a failure, never as a pass", async () => {
    const offline: HeadFetcher = async () => {
      throw new Error("getaddrinfo ENOTFOUND github.com");
    };
    const result = await verifySources([source()], offline);

    expect(result.failures).toHaveLength(1);
    expect(result.failures[0].status).toBe("unreachable");
    expect(result.failures[0].detail).toMatch(/ENOTFOUND/);
  });

  it("exempts only the source types that have nothing public to point at", async () => {
    const sources = URL_EXEMPT_SOURCE_TYPES.map((type) =>
      source({ id: `src.${type}`, type, url: undefined, commitSha: undefined }),
    );
    const result = await verifySources(sources, reachable);

    expect(result.failures).toEqual([]);
    expect(result.exempt).toBe(URL_EXEMPT_SOURCE_TYPES.length);
    expect(result.checked).toBe(0);
  });

  it("refuses a URL-less source of any other type", async () => {
    const result = await verifySources(
      [
        source({
          id: "src.report",
          type: "report",
          url: undefined,
          commitSha: undefined,
        }),
      ],
      reachable,
    );

    expect(result.failures).toHaveLength(1);
    expect(result.failures[0].status).toBe("gap");
    expect(result.failures[0].detail).toMatch(/must carry a URL/);
  });

  it("reports every failure, not just the first", async () => {
    const notFound: HeadFetcher = async () => ({ ok: false, status: 404 });
    const result = await verifySources(
      [source({ id: "src.a" }), source({ id: "src.b" }), source({ id: "src.c" })],
      notFound,
    );
    expect(result.failures.map((f) => f.id)).toEqual(["src.a", "src.b", "src.c"]);
  });
});

describe("pin integrity (M27)", () => {
  it("accepts a URL that carries the commit it claims", () => {
    expect(urlMatchesPin(source())).toBe(true);
  });

  it("rejects a URL pointing at a branch while claiming a pin", () => {
    expect(
      urlMatchesPin(
        source({ url: "https://github.com/anishakode/repo/blob/main/app/main.py" }),
      ),
    ).toBe(false);
  });

  it("holds for every source in the real corpus", () => {
    const sources = getGraph().sources;
    const drifted = sources.filter((s) => !urlMatchesPin(s));
    expect(drifted.map((s) => s.id)).toEqual([]);
  });
});
