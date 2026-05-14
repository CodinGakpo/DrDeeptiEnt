import { Link } from "react-router-dom";
import { useSeo } from "../seo/useSeo";

export default function NotFound() {
  useSeo({
    title: "Page Not Found | Dr. Deepti Sinha ENT",
    description: "The requested page was not found. Return to the clinic home or booking page.",
    canonical: "https://drdeeptientdelhi.in/404",
    robots: "noindex, nofollow",
  });

  return (
    <div className="py-4 sm:py-6">
      <div className="rounded-[28px] border border-[var(--color-line)] bg-[linear-gradient(145deg,var(--color-paper),#f8fcfb)] p-5 text-center shadow-[0_24px_60px_rgba(36,53,51,0.06)] sm:p-8">
        <p className="text-[11px] uppercase tracking-[0.3em] text-[var(--color-wood)]">
          Page missing
        </p>
        <h1 className="mt-3 font-serif text-3xl text-[var(--color-ink)] sm:text-4xl">
          This route does not exist in the clinic flow.
        </h1>
        <p className="mt-4 text-sm leading-7 text-[var(--color-mist)]">
          Use the home page to review Dr. Deepti Sinha&apos;s profile or jump straight into the
          appointment booking flow.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            className="inline-flex w-full items-center justify-center rounded-full bg-[var(--color-cyan-deep)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-cyan)] sm:w-auto"
            to="/"
          >
            Go home
          </Link>
          <Link
            className="inline-flex w-full items-center justify-center rounded-full border border-[rgba(138,102,72,0.26)] bg-[var(--color-paper-soft)] px-6 py-3 text-sm font-semibold text-[var(--color-wood-deep)] transition hover:bg-[var(--color-wood-soft)] sm:w-auto"
            to="/book"
          >
            Open booking
          </Link>
        </div>
      </div>
    </div>
  );
}
