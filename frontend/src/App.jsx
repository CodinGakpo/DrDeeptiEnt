import { NavLink, Outlet } from "react-router-dom";

const navLinkClass = ({ isActive }) =>
  `rounded-full px-4 py-2 text-sm font-medium transition ${
    isActive
      ? "bg-[var(--color-cyan-soft)] text-[var(--color-cyan-deep)]"
      : "text-[var(--color-mist)] hover:bg-[var(--color-paper-soft)] hover:text-[var(--color-ink)]"
  }`;

export default function App() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--color-bg)] text-[var(--color-ink)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(118,183,177,0.18),transparent_34%),radial-gradient(circle_at_84%_10%,rgba(138,102,72,0.12),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.55),transparent_26%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[24rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.65),transparent)]" />

      <div className="relative z-10">
        <header className="mx-auto flex max-w-6xl items-center justify-between px-5 pt-6 pb-4 sm:px-8">
          <NavLink className="flex items-center gap-3" to="/">
            <span className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-[linear-gradient(135deg,var(--color-cyan),var(--color-cyan-deep))] text-base font-bold text-white shadow-[0_18px_34px_rgba(45,124,119,0.18)]">
              DS
            </span>
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-[var(--color-wood)]">
                ENT care in Delhi
              </p>
              <p className="font-serif text-xl text-[var(--color-ink)]">Dr. Deepti Sinha</p>
            </div>
          </NavLink>

          <div className="hidden items-center gap-2 rounded-full border border-[var(--color-line)] bg-[rgba(255,255,255,0.72)] p-1.5 shadow-[0_10px_28px_rgba(36,53,51,0.06)] md:flex">
            <NavLink className={navLinkClass} end to="/">
              Home
            </NavLink>
            <NavLink className={navLinkClass} to="/book">
              Book visit
            </NavLink>
          </div>

          <div className="flex items-center gap-3">
            <a
              className="hidden text-sm font-medium text-[var(--color-mist)] transition hover:text-[var(--color-ink)] sm:inline"
              href="/admin/"
            >
              Admin
            </a>
            <NavLink
              className="rounded-full bg-[var(--color-cyan-deep)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--color-cyan)]"
              to="/book"
            >
              Book appointment
            </NavLink>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-5 pb-16 sm:px-8">
          <Outlet />
        </main>

        <footer className="mx-auto max-w-6xl border-t border-[var(--color-line)] px-5 py-8 text-sm text-[var(--color-mist)] sm:px-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <p>Hospital-style ENT booking for a focused clinic workflow.</p>
            <div className="flex flex-wrap gap-4">
              <a className="transition hover:text-[var(--color-ink)]" href="/book">
                Book a visit
              </a>
              <a className="transition hover:text-[var(--color-ink)]" href="/admin/">
                Open admin
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
