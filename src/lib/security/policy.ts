/**
 * M24 production security policy.
 *
 * Nonce-based CSP was rejected deliberately: in this Next version nonces require
 * dynamic rendering for every page, which would turn 29 static routes into
 * per-request renders. This site ships no third-party scripts and no
 * user-generated HTML, so that trade buys little and costs the recruiter path a
 * measurable amount. See ADR 0026.
 */

export type PolicyEnv = { isDev: boolean; isSecureOrigin: boolean };

/**
 * `'unsafe-inline'` stays in `script-src` because the App Router streams its RSC
 * payload through inline bootstrap scripts. `'unsafe-eval'` is development-only —
 * React uses `eval` there for server-error reconstruction, never in production.
 */
export function buildContentSecurityPolicy({ isDev }: Pick<PolicyEnv, "isDev">): string {
  const scriptSrc = ["'self'", "'unsafe-inline'"];
  if (isDev) scriptSrc.push("'unsafe-eval'");

  return [
    "default-src 'self'",
    `script-src ${scriptSrc.join(" ")}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    // The site talks to its own origin only; no analytics or provider beacons.
    `connect-src 'self'${isDev ? " ws: wss:" : ""}`,
    "object-src 'none'",
    "media-src 'none'",
    "frame-src 'none'",
    "worker-src 'self' blob:",
    "manifest-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    ...(isDev ? [] : ["upgrade-insecure-requests"]),
  ].join("; ");
}

export const PERMISSIONS_POLICY = [
  "accelerometer=()",
  "autoplay=()",
  "camera=()",
  "display-capture=()",
  "geolocation=()",
  "gyroscope=()",
  "interest-cohort=()",
  "microphone=()",
  "payment=()",
  "usb=()",
].join(", ");

export type SecurityHeader = { key: string; value: string };

/** HSTS is emitted only for a configured HTTPS origin — never faked in local dev. */
export function securityHeaders({ isDev, isSecureOrigin }: PolicyEnv): SecurityHeader[] {
  const headers: SecurityHeader[] = [
    { key: "Content-Security-Policy", value: buildContentSecurityPolicy({ isDev }) },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "Permissions-Policy", value: PERMISSIONS_POLICY },
    { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
    { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
  ];

  if (isSecureOrigin) {
    headers.push({
      key: "Strict-Transport-Security",
      value: "max-age=63072000; includeSubDomains; preload",
    });
  }

  return headers;
}
