import { PageShell } from "@/components/page-shell";
import { displayHostPath, getProfile } from "@/lib/evidence/queries";

export const metadata = {
  title: "Contact",
  alternates: { canonical: "/contact" },
  description: "Email and public profiles for Anish Akode.",
};

export default function ContactPage() {
  const profile = getProfile();

  return (
    <PageShell
      title="Contact"
      description="Prefer email for opportunities. Public profiles are linked from the Evidence Graph."
    >
      <ul className="space-y-4 text-base">
        <li className="flex flex-wrap gap-2">
          <span className="text-[var(--muted)]">Email</span>
          <a className="underline underline-offset-4" href={`mailto:${profile.email}`}>
            {profile.email}
          </a>
        </li>
        <li className="flex flex-wrap gap-2">
          <span className="text-[var(--muted)]">GitHub</span>
          <a
            className="underline underline-offset-4"
            href={profile.links.github}
            rel="noopener noreferrer"
            target="_blank"
          >
            {displayHostPath(profile.links.github)}
          </a>
        </li>
        <li className="flex flex-wrap gap-2">
          <span className="text-[var(--muted)]">LinkedIn</span>
          <a
            className="underline underline-offset-4"
            href={profile.links.linkedin}
            rel="noopener noreferrer"
            target="_blank"
          >
            {displayHostPath(profile.links.linkedin)}
          </a>
        </li>
        <li className="pt-2 text-[var(--muted)]">{profile.location}</li>
      </ul>
    </PageShell>
  );
}
