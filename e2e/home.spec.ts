import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.describe("M2 utility portfolio — strict recruiter edges", () => {
  test("home shows identity and complete primary nav", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Anish Akode" })).toBeVisible();
    await expect(
      page.getByText("AI · ML · Software Engineering", { exact: true }),
    ).toBeVisible();
    const nav = page.getByRole("navigation", { name: "Primary" });
    for (const label of ["Work", "Labs", "Experience", "About", "CV", "Contact"]) {
      await expect(nav.getByRole("link", { name: label })).toBeVisible();
    }

    // Fork and Interview moved to the footer at M27 so the labs could take a
    // top-level slot. They must stay reachable, and must not be back up here.
    await expect(nav.getByRole("link", { name: "Fork Anish" })).toHaveCount(0);
    const session = page.getByRole("navigation", { name: "Session surfaces" });
    for (const label of [
      "Fork Anish",
      "Interview my work",
      "Under the surface",
      "Ending signal",
    ]) {
      await expect(session.getByRole("link", { name: label })).toBeVisible();
    }
  });

  test("Labs index lists every lab and is reachable from the primary nav", async ({
    page,
  }) => {
    await page.goto("/");
    await page
      .getByRole("navigation", { name: "Primary" })
      .getByRole("link", { name: "Labs" })
      .click();
    await expect(page.getByRole("heading", { name: "Runtime Labs" })).toBeVisible();

    const labs = page.getByLabel("Runtime Labs").locator("> li");
    await expect(labs).toHaveCount(3);
    // Each lab must badge itself on the index, where the choice is made.
    for (const name of [
      "MLOps Runtime Lab",
      "Steward Agent Lab",
      "PDF Malware Explainability Lab",
    ]) {
      await expect(labs.filter({ hasText: name })).toContainText("PORTFOLIO EXTENSION");
    }

    await page.getByRole("link", { name: /MLOps Runtime Lab/ }).click();
    await expect(page.getByRole("heading", { name: "MLOps Runtime Lab" })).toBeVisible();
  });

  test("utility routes are reachable with graph content", async ({ page }) => {
    for (const path of ["/work", "/experience", "/about", "/cv", "/contact"]) {
      const response = await page.goto(path);
      expect(response?.ok()).toBeTruthy();
    }
    await page.goto("/work/mlops-governance-dashboard");
    await expect(
      page.getByRole("heading", { level: 1, name: /MLOps Governance/i }),
    ).toBeVisible();
    const pinned = page.getByRole("link", {
      name: /MLOps-Governance-Dashboard @[a-f0-9]{7}/i,
    });
    await expect(pinned).toBeVisible();
    await expect(pinned).toHaveAttribute("href", /\/tree\/[a-f0-9]{40}/i);
  });

  test("invalid project slug returns 404 page", async ({ page }) => {
    const response = await page.goto("/work/not-a-real-project");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: /Page not found/i })).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Primary" })).toBeVisible();
  });

  test("experience surfaces owner-confirmation note and metrics", async ({ page }) => {
    await page.goto("/experience");
    await expect(page.getByText(/30% fewer API integration defects/i)).toBeVisible();
    await expect(
      page.getByText(/Proprietary employer source code is not public/i),
    ).toBeVisible();
  });

  test("contact exposes only canonical channels", async ({ page }) => {
    await page.goto("/contact");
    await expect(
      page.getByRole("link", { name: "anishakode3101@gmail.com" }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "github.com/anishakode" })).toBeVisible();
    await expect(page.locator("body")).not.toContainText("anishakode2002@gmail.com");
    await expect(page.locator("body")).not.toContainText("sricons");
  });

  test("llms.txt is machine-readable and excludes obsolete email", async ({
    request,
  }) => {
    const res = await request.get("/llms.txt");
    expect(res.ok()).toBeTruthy();
    expect(res.headers()["content-type"]).toMatch(/text\/plain/);
    const body = await res.text();
    expect(body).toContain("ANISH // RUNTIME");
    expect(body).toContain("Anish Akode");
    expect(body).toContain("/work");
    expect(body).toContain("/evidence.json");
    expect(body).toContain("anishakode3101@gmail.com");
    expect(body).not.toContain("anishakode2002@gmail.com");
  });

  test("evidence.json is a derived public manifest", async ({ request }) => {
    const res = await request.get("/evidence.json");
    expect(res.ok()).toBeTruthy();
    expect(res.headers()["content-type"]).toMatch(/application\/json/);
    expect(res.headers()["x-evidence-projection"]).toBe("derived");
    const body = await res.json();
    expect(body.schema).toBe("anish-runtime.evidence.public");
    expect(body.profile.name).toBe("Anish Akode");
    expect(JSON.stringify(body)).not.toContain("anishakode2002@gmail.com");
  });

  test("home has no critical axe violations", async ({ page }) => {
    await page.goto("/");
    const results = await new AxeBuilder({ page }).analyze();
    const critical = results.violations.filter((v) => v.impact === "critical");
    expect(critical).toEqual([]);
  });

  test("RUN ANISH compiles and can be skipped to a settled runtime", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("button", { name: "RUN ANISH" })).toBeVisible();
    await page.getByRole("button", { name: "RUN ANISH" }).click();
    await expect(page.getByRole("button", { name: /Skip compilation/i })).toBeVisible();
    await page.getByRole("button", { name: /Skip compilation/i }).click();
    await expect(page.getByText(/System ready/i)).toBeVisible();
    await expect(page.getByText(/Journey mode · 2 MIN/i)).toBeVisible();
    await expect(page.getByRole("heading", { name: "Anish Akode" })).toBeFocused();
    await expect(page.getByRole("link", { name: /MLOps Governance/i })).toBeVisible();
    await page.getByRole("button", { name: /Reset runtime/i }).click();
    await expect(page.getByRole("button", { name: "RUN ANISH" })).toBeVisible();
    await expect(page.getByRole("button", { name: "RUN ANISH" })).toBeFocused();
  });

  test("Escape during compilation settles the runtime", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "RUN ANISH" }).click();
    await expect(page.getByRole("button", { name: /Skip compilation/i })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByText(/System ready/i)).toBeVisible();
    await expect(page.getByRole("heading", { name: "Anish Akode" })).toBeFocused();
  });

  test("reduced motion settles immediately without compile steps", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await page.getByRole("button", { name: "RUN ANISH" }).click();
    await expect(page.getByText(/System ready/i)).toBeVisible();
    await expect(page.getByText("Identity located")).toHaveCount(0);
  });

  test("20 SEC journey settles to a single featured flagship", async ({ page }) => {
    await page.goto("/");
    await page.locator("label[for='journey-20s']").click();
    await page.getByRole("button", { name: "RUN ANISH" }).click();
    await page.getByRole("button", { name: /Skip compilation/i }).click();
    await expect(page.getByText(/Journey mode · 20 SEC/i)).toBeVisible();
    await expect(page.getByRole("list", { name: "Featured flagship" })).toBeVisible();
    await expect(page.locator("#main").getByRole("link", { name: "CV" })).toHaveClass(
      /btn-primary/,
    );
  });

  test("project pages keep weak evidence states visible", async ({ page }) => {
    await page.goto("/work/mlops-governance-dashboard");
    await expect(page.getByRole("heading", { name: /Inspection lenses/i })).toBeVisible();
    await page.getByRole("tab", { name: "RUN" }).click();
    await expect(page.getByText(/PORTFOLIO EXTENSION/i).first()).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Open dedicated MLOps Runtime Lab/i }),
    ).toBeVisible();
    await page.goto("/work/explainable-pdf-malware-detection");
    await page.getByRole("tab", { name: "RUN" }).click();
    await expect(page.getByText(/LIMITED EVIDENCE/i).first()).toBeVisible();
  });

  test("MLOps Runtime Lab exposes controls and honesty boundary", async ({ page }) => {
    await page.goto("/labs/mlops");
    await expect(page.getByRole("heading", { name: "MLOps Runtime Lab" })).toBeVisible();
    await expect(page.getByText(/PORTFOLIO EXTENSION/i).first()).toBeVisible();
    await expect(page.getByRole("button", { name: /SHIFT DATA/i })).toBeVisible();
    await expect(page.getByRole("table")).toBeVisible();
    await page.getByRole("button", { name: /BREAK THE SYSTEM/i }).click();
    await expect(page.getByText(/Monitor · incident/i)).toBeVisible();
    await expect(page.getByRole("heading", { name: /Watch Anish Debug/i })).toBeVisible();
    await page.getByRole("button", { name: /^RECOVER$/i }).click();
    await expect(page.getByText(/Monitor · healthy/i)).toBeVisible();
  });

  test("Autopsy X-RAY deep-link surfaces Project X-Ray and architecture", async ({
    page,
  }) => {
    await page.goto("/work/mlops-governance-dashboard#project-xray");
    await expect(page.getByRole("tab", { name: "X-RAY" })).toHaveAttribute(
      "aria-selected",
      "true",
      { timeout: 15_000 },
    );
    await expect(page.locator("#project-xray")).toBeVisible();
    await expect(page.getByText(/Architecture reasoning reconstruction/i)).toBeVisible();
  });

  test("Reversible Architecture hash opens X-RAY lens", async ({ page }) => {
    await page.goto("/work/mlops-governance-dashboard#reversible-architecture");
    await expect(page.getByRole("tab", { name: "X-RAY" })).toHaveAttribute(
      "aria-selected",
      "true",
      { timeout: 15_000 },
    );
    await expect(page.locator("#reversible-architecture")).toBeVisible();
  });

  test("Source Trace opens from Autopsy DECISIONS and closes on Escape", async ({
    page,
  }) => {
    await page.goto("/work/mlops-governance-dashboard");
    await page.getByRole("tab", { name: "DECISIONS" }).click();
    await page
      .getByRole("button", { name: /Trace decision sources/i })
      .first()
      .click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText(/SHA-pinned/i).first()).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });

  test("footer reflects locked milestone stage", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText(/locked through M27/i)).toBeVisible();
  });

  test("Signal Recompile requires consent after distinct ML lean", async ({ page }) => {
    // The session trail is in-memory, so the lean must build through client-side
    // navigation — a full reload is a new session, exactly as a visitor experiences it.
    await page.goto("/work");
    await page.waitForLoadState("networkidle");

    for (const [project, slug] of [
      ["MLOps Governance Dashboard", "mlops-governance-dashboard"],
      ["Explainable PDF Malware Detection", "explainable-pdf-malware-detection"],
      ["Fraud Detection", "fraud-detection"],
      ["Feynn EV Analysis", "feynn-ev-analysis"],
    ]) {
      await page.getByRole("link", { name: project, exact: true }).first().click();
      // Generous: the heaviest project route compiles on demand in dev.
      await expect(page).toHaveURL(new RegExp(`/work/${slug}$`), { timeout: 20_000 });
      await page
        .getByRole("navigation", { name: "Primary" })
        .getByRole("link", { name: "Work" })
        .click();
      await expect(page).toHaveURL(/\/work$/, { timeout: 20_000 });
    }

    await expect(page.getByLabel(/Signal recompile prompt/i)).toBeVisible();
    await expect(page.getByText(/ML ENGINEERING/i).first()).toBeVisible();
    await page.getByRole("button", { name: /^WHY\?$/i }).click();
    await expect(page.getByText(/Session-only/i)).toBeVisible();
    await page.getByRole("button", { name: /^RECOMPILE$/i }).click();
    await expect(page.getByLabel(/Session recompile active/i)).toBeVisible();
    await page.getByRole("button", { name: /^RESET$/i }).click();
    await expect(page.getByLabel(/Session recompile active/i)).toHaveCount(0);
  });

  test("Steward Agent Lab exposes scenarios and honesty boundary", async ({ page }) => {
    await page.goto("/labs/steward");
    await expect(page.getByRole("heading", { name: "Steward Agent Lab" })).toBeVisible();
    await expect(page.getByText(/PORTFOLIO EXTENSION/i).first()).toBeVisible();
    await expect(page.getByText(/No live FHIR/i).first()).toBeVisible();
    await page.getByRole("radio", { name: /Allergy conflict/i }).click();
    await expect(page.getByText(/Treatment advice withheld by design/i)).toBeVisible();
    await expect(page.getByRole("table")).toBeVisible();
  });

  test("PDF Malware Explainability Lab withholds verdict and forbids upload", async ({
    page,
  }) => {
    await page.goto("/labs/malware");
    await expect(
      page.getByRole("heading", { name: "PDF Malware Explainability Lab" }),
    ).toBeVisible();
    await expect(page.getByText(/PORTFOLIO EXTENSION/i).first()).toBeVisible();
    await expect(page.getByText(/No malware execution/i).first()).toBeVisible();
    await expect(page.getByText(/No file upload/i).first()).toBeVisible();
    await expect(page.getByText(/Not a security verdict/i).first()).toBeVisible();
    await expect(page.getByText(/LIMITED EVIDENCE/i).first()).toBeVisible();
    await expect(page.getByRole("button", { name: /upload/i })).toHaveCount(0);
    await expect(page.locator('input[type="file"]')).toHaveCount(0);
    await expect(page.getByText(/Study signal ·/i)).toContainText("0.50");
    await page.getByRole("button", { name: /Embedded files/i }).click();
    await expect(page.getByRole("button", { name: /Embedded files/i })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(page.getByText(/Study signal ·/i)).toContainText("0.68");
    await expect(page.getByRole("table")).toBeVisible();
    await expect(page.getByText(/malware detected/i)).toHaveCount(0);
  });

  test("Failure Museum stays empty behind the artifact gate", async ({ page }) => {
    await page.goto("/failures");
    await expect(
      page.getByRole("heading", { level: 1, name: "Failure Museum" }),
    ).toBeVisible();
    await expect(page.getByText(/NOT DEMONSTRATED/i).first()).toBeVisible();
    await expect(page.getByText(/Published exhibits: /i)).toContainText("0");
    await expect(
      page.getByRole("heading", { name: /Artifact-grade publication gate/i }),
    ).toBeVisible();
    await expect(page.getByText(/Empty truthful museum/i).first()).toBeVisible();
    await expect(page.getByText(/severe minority-class failure/i)).toHaveCount(0);
  });

  test("ASK RUNTIME searches evidence without inventing facts", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("button", { name: /ASK RUNTIME/i })).toBeVisible();
    await page.getByRole("button", { name: /ASK RUNTIME/i }).click();
    await expect(
      page.getByRole("heading", { name: /Deterministic evidence search/i }),
    ).toBeVisible();
    await expect(page.getByText(/not chat/i).first()).toBeVisible();
    await page.getByLabel(/Search evidence/i).fill("shap");
    await expect(page.getByText(/LIMITED EVIDENCE/i).first()).toBeVisible();
    await page
      .getByLabel(/Search evidence/i)
      .fill("systems that watch model drift and explain pdf risk signals");
    await expect(
      page.getByRole("heading", { name: /Semantic relevance \(not proof\)/i }),
    ).toBeVisible();
    await expect(page.getByText(/similarity never upgrades proof/i)).toBeVisible();
    await page.getByLabel(/Search evidence/i).fill("zzzznotanentity");
    await expect(page.getByText(/No canonical evidence matched/i)).toBeVisible();
    await page.getByLabel(/Search evidence/i).fill("cardstack");
    await expect(
      page.getByRole("button", { name: /INTERPRET WITH SIGNAL/i }),
    ).toBeVisible();
    await page.getByRole("button", { name: /INTERPRET WITH SIGNAL/i }).click();
    await expect(
      page.getByRole("region", { name: /Signal interpretation/i }),
    ).toBeVisible();
    await expect(page.getByText(/The UI is the AI response/i)).toBeVisible();
    await expect(page.getByLabel(/Composed evidence UI/i)).toBeVisible();
    await expect(page.getByText(/allowlisted evidence tools/i).first()).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });

  test("Fork Anish maps a JD to a temporary branch without fit scores", async ({
    page,
  }) => {
    await page.goto("/fork");
    await expect(page.getByRole("heading", { name: "Fork Anish" })).toBeVisible();
    await page.getByRole("button", { name: /Try sample MLOps JD/i }).click();
    await expect(page.getByLabel(/Fork role branch/i)).toBeVisible();
    await expect(
      page.getByText(/I won't claim experience I can't demonstrate/i),
    ).toBeVisible();
    await expect(page.getByText(/overall fit score: not generated/i)).toBeVisible();
    await expect(page.getByText(/fit %|hiring decision|culture fit/i)).toHaveCount(0);
  });

  test("Interview My Work needs a canonical trail and never answers for Anish", async ({
    page,
  }) => {
    await page.goto("/interview");
    await expect(page.getByRole("heading", { name: "Interview my work" })).toBeVisible();

    await page.getByRole("button", { name: /BUILD QUESTION SET/i }).click();
    await expect(
      page.getByText(/No canonical evidence was inspected in this session yet/i),
    ).toBeVisible();

    await page.goto("/labs/mlops");
    await page.goto("/work/steward-ai");
    await page.getByRole("link", { name: "Interview my work" }).click();
    await page.getByRole("button", { name: /BUILD QUESTION SET/i }).click();

    const questions = page.getByLabel("Questions").locator("> li");
    expect(await questions.count()).toBeGreaterThan(0);
    expect(await questions.count()).toBeLessThanOrEqual(3);

    await page
      .getByRole("button", { name: /WHY THIS QUESTION\?/i })
      .first()
      .click();
    await expect(page.getByText(/matched triggers:/i).first()).toBeVisible();

    const answerKey = page.getByLabel("Answer key");
    await expect(answerKey).toContainText("Not generated.");
    await expect(
      page.getByText(/candidate score|hiring score|model answer/i),
    ).toHaveCount(0);
  });

  test("Under the Surface labels subsystems and records a safe runtime trace", async ({
    page,
  }) => {
    await page.goto("/surface");
    await expect(page.getByRole("heading", { name: "Under the surface" })).toBeVisible();
    await expect(page.getByText(/No runtime actions in this session yet/i)).toBeVisible();

    const layers = page.getByLabel("Architecture layers");
    await layers.getByRole("button", { name: /^RUNTIME/ }).click();
    const mlopsLab = page
      .getByLabel("RUNTIME subsystems")
      .getByRole("listitem")
      .filter({ hasText: "MLOps Runtime Lab" });
    await expect(mlopsLab).toContainText("PORTFOLIO SIMULATION");

    // Client-side navigation keeps the in-memory trace alive across the action.
    await page.getByRole("link", { name: "Fork Anish" }).click();
    await page.getByRole("button", { name: /Try sample MLOps JD/i }).click();
    await page.getByRole("link", { name: "Under the surface" }).click();

    const entries = page.getByLabel("Runtime trace entries");
    await expect(entries.getByText("Fork Anish branch")).toBeVisible();
    await expect(entries).not.toContainText("Kubernetes");
    await expect(entries.getByText(/tools: NOT COLLECTED/i)).toBeVisible();

    await page.getByRole("button", { name: /CLEAR TRACE/i }).click();
    await expect(page.getByText(/No runtime actions in this session yet/i)).toBeVisible();
  });

  test("Ending Signal stays shallow for an inactive visitor", async ({ page }) => {
    await page.goto("/ending");
    await expect(page.getByText("YOUR PATH THROUGH ANISH")).toBeVisible();
    await expect(page.getByText("SHALLOW")).toBeVisible();
    await expect(
      page.getByText(/No canonical evidence was opened in this session/i),
    ).toBeVisible();
    await expect(page.getByText("This describes this session, not you.")).toBeVisible();

    await page.getByRole("button", { name: /WHY THIS SIGNAL\?/i }).click();
    await expect(page.getByText("Employer identity")).toBeVisible();
    await expect(page.getByText("Persistent behaviour profiles")).toBeVisible();

    const manifest = page.getByLabel("Journey integrity manifest");
    await expect(manifest).toContainText("external tracking used: 0");
    await expect(manifest).toContainText("inferred personal traits: 0");
  });

  test("Ending Signal replays a real MLOps challenge without inventing history", async ({
    page,
  }) => {
    await page.goto("/labs/mlops");
    await page.getByRole("button", { name: "BREAK THE SYSTEM" }).click();
    await page.getByRole("button", { name: "RECOVER" }).click();

    // Client-side navigation preserves the in-memory session and trace.
    await page.getByRole("link", { name: "Ending signal" }).click();

    const nodes = page.getByLabel("Journey nodes").getByRole("listitem");
    await expect(nodes.first()).toContainText("MLOps Runtime Lab");

    const challenges = page.getByLabel("Completed challenges");
    await expect(challenges).toContainText("MLOps controlled incident recovered");
    await expect(page.getByText("The last unresolved node is the human.")).toBeVisible();
    await expect(
      page.getByLabel("Contact actions").getByRole("link", { name: "LinkedIn" }),
    ).toBeVisible();
  });
});
