import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";

export default function NotFound() {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-[var(--surface)] text-[var(--on-surface)]">
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <SiteHeader />
      <main
        id="main"
        className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center gap-4 px-6 py-16"
      >
        <p className="eyebrow">404</p>
        <h1 className="page-title">Page not found</h1>
        <p className="page-lede">
          That route is not part of the utility portfolio. Try Work, Experience, About,
          CV, or Contact.
        </p>
        <p>
          <Link href="/" className="btn-secondary">
            Back to home
          </Link>
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
