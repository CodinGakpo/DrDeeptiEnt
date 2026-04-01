import { NavLink, Outlet } from "react-router-dom";

const navLinkClass = ({ isActive }) =>
  `shrink-0 whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-medium transition ${
    isActive
      ? "bg-[var(--color-cyan-soft)] text-[var(--color-cyan-deep)] shadow-[0_10px_24px_rgba(45,124,119,0.12)]"
      : "text-[var(--color-mist)] hover:bg-[var(--color-paper-soft)] hover:text-[var(--color-ink)]"
  }`;

export default function App() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-(--color-bg) text-(--color-ink)">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(118,183,177,0.16),transparent_34%),radial-gradient(circle_at_84%_10%,rgba(138,102,72,0.12),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.5),transparent_26%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[18rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.62),transparent)]" />

      <div className="relative z-10">
        <header className="sticky top-0 z-30 border-b border-[rgba(97,115,111,0.12)] bg-[rgba(246,243,237,0.88)] backdrop-blur-xl">
          <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-start justify-between gap-3 sm:items-center">
              <NavLink className="min-w-0" to="/">
                <p className="text-[10px] uppercase tracking-[0.28em] text-[var(--color-wood)] sm:text-xs">
                  ENT care in Delhi
                </p>
                <p className="truncate font-serif text-lg text-[var(--color-ink)] sm:text-xl">
                  Dr. Deepti Sinha
                </p>
              </NavLink>

              <NavLink
                className="shrink-0 rounded-full bg-[var(--color-cyan-deep)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--color-cyan)]"
                to="/book"
              >
                Book visit
              </NavLink>
            </div>

            <nav className="no-scrollbar mt-4 flex gap-2 overflow-x-auto pb-1">
              <NavLink className={navLinkClass} end to="/">
                Home
              </NavLink>
              <NavLink className={navLinkClass} to="/doctors/1">
                Doctor profile
              </NavLink>
              <NavLink className={navLinkClass} to="/recognition">
                Recognition
              </NavLink>
              <NavLink className={navLinkClass} to="/book">
                Book visit
              </NavLink>
            </nav>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 pb-14 pt-4 sm:px-6 sm:pt-6 lg:px-8 lg:pb-16">
          <Outlet />
        </main>

        <footer className="mx-auto max-w-6xl border-t border-[var(--color-line)] px-4 py-8 text-sm text-[var(--color-mist)] sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-xl leading-6">
              Mobile-first ENT booking designed for a focused, professional clinic journey.
            </p>
            <div className="flex flex-wrap gap-4">
              <NavLink className="transition hover:text-[var(--color-ink)]" to="/book">
                Book a visit
              </NavLink>
              <NavLink className="transition hover:text-[var(--color-ink)]" to="/doctors/1">
                Doctor profile
              </NavLink>
              <NavLink className="transition hover:text-[var(--color-ink)]" to="/recognition">
                Recognition
              </NavLink>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
