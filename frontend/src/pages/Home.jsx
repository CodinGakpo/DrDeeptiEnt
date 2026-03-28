import { useEffect } from "react";
import { Link } from "react-router-dom";

import { useBooking } from "../hooks/useBooking";
import { formatShortDate } from "../utils/formatters";
import { getPrimaryDoctorProfile } from "../utils/doctorProfiles";

const treatmentHighlights = [
  "Nasal blockage",
  "Rhinosinusitis",
  "Allergies",
  "Endoscopic sinus surgery",
  "Vertigo diagnosis and management",
  "General ENT surgery",
];

export default function Home() {
  const { doctors, error, loadDoctors, loadingDoctors } = useBooking();

  useEffect(() => {
    loadDoctors().catch(() => {});
  }, [loadDoctors]);

  const doctor = getPrimaryDoctorProfile(doctors);
  const featuredAdvice = doctor.publicAdvice[0];
  const supportingAdvice = doctor.publicAdvice.slice(1);

  return (
    <div className="space-y-10 py-6 md:py-10">
      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[36px] border border-[var(--color-line)] bg-[linear-gradient(145deg,var(--color-paper),#f8fcfb)] p-7 shadow-[0_24px_60px_rgba(36,53,51,0.08)] md:p-10">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-wood)]">
            Lead Consultant ENT Surgeon
          </p>

          <h1 className="mt-4 font-serif text-4xl leading-tight text-[var(--color-ink)] sm:text-5xl">
            {doctor.name}
          </h1>

          <p className="mt-4 max-w-3xl text-sm font-semibold leading-7 text-[var(--color-cyan-deep)] sm:text-base">
            {doctor.credentials} | {doctor.headline}
          </p>

          <p className="mt-5 max-w-3xl text-base leading-8 text-[var(--color-mist)]">
            {doctor.summary} {doctor.mission}
          </p>

          <div className="mt-6 flex flex-wrap gap-3 text-sm text-[var(--color-mist)]">
            <span className="rounded-full bg-[var(--color-cyan-soft)] px-4 py-2 text-[var(--color-cyan-deep)]">
              {doctor.currentPractice}
            </span>
            <span className="rounded-full bg-[var(--color-paper-soft)] px-4 py-2 text-[var(--color-wood-deep)]">
              {doctor.location}
            </span>
            <a
              className="rounded-full bg-[var(--color-paper-soft)] px-4 py-2 text-[var(--color-wood-deep)] transition hover:bg-[var(--color-wood-soft)]"
              href={`mailto:${doctor.email}`}
            >
              {doctor.email}
            </a>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              className="inline-flex items-center justify-center rounded-full bg-[var(--color-cyan-deep)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-cyan)]"
              to={doctor.appointmentLink}
            >
              Book an appointment
            </Link>
            <a
              className="inline-flex items-center justify-center rounded-full border border-[rgba(138,102,72,0.26)] bg-[var(--color-paper-soft)] px-6 py-3 text-sm font-semibold text-[var(--color-wood-deep)] transition hover:bg-[var(--color-wood-soft)]"
              href="#patient-guidance"
            >
              Read patient guidance
            </a>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {doctor.quickFacts.map((fact) => (
              <div
                key={fact.label}
                className="rounded-[28px] border border-[var(--color-line)] bg-[var(--color-paper-soft)] p-5"
              >
                <p className="text-xs uppercase tracking-[0.24em] text-[var(--color-wood)]">
                  {fact.label}
                </p>
                <p className="mt-3 text-2xl font-semibold text-[var(--color-ink)]">
                  {fact.value}
                </p>
                <p className="mt-2 text-sm leading-6 text-[var(--color-mist)]">
                  {fact.detail}
                </p>
              </div>
            ))}
          </div>
        </div>

        <aside className="grid gap-4">
          <div className="rounded-[32px] border border-[var(--color-line)] bg-[linear-gradient(145deg,#eef7f5,var(--color-paper))] p-6 shadow-[0_20px_48px_rgba(36,53,51,0.06)]">
            <p className="text-xs uppercase tracking-[0.28em] text-[var(--color-wood)]">
              Current availability
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-[var(--color-ink)]">
              Hospital-style booking, specialist-led care
            </h2>
            <p className="mt-3 text-sm leading-7 text-[var(--color-mist)]">
              Patients can review Dr. Deepti Sinha&apos;s profile, pick an available time, and
              confirm the appointment without navigating a crowded multi-doctor portal.
            </p>

            <div className="mt-5 rounded-[24px] border border-[var(--color-line)] bg-[var(--color-paper)] p-5">
              <p className="text-xs uppercase tracking-[0.22em] text-[var(--color-cyan-deep)]">
                Next published slot
              </p>
              <p className="mt-2 text-xl font-semibold text-[var(--color-ink)]">
                {loadingDoctors
                  ? "Syncing schedule..."
                  : formatShortDate(doctor.next_available_date)}
              </p>
              <p className="mt-2 text-sm text-[var(--color-mist)]">
                {doctor.open_slot_count} open future slots currently visible in the booking flow.
              </p>
            </div>
          </div>

          <div className="rounded-[32px] border border-[var(--color-line)] bg-[linear-gradient(145deg,#fffdf9,#f8f2ea)] p-6 shadow-[0_20px_48px_rgba(36,53,51,0.05)]">
            <p className="text-xs uppercase tracking-[0.28em] text-[var(--color-wood)]">
              Professional path
            </p>
            <div className="mt-4 space-y-4">
              {doctor.timeline.slice(0, 2).map((item) => (
                <div
                  key={`${item.title}-${item.period}`}
                  className="rounded-[22px] border border-[rgba(138,102,72,0.18)] bg-white/80 p-4"
                >
                  <p className="text-sm font-semibold text-[var(--color-ink)]">{item.title}</p>
                  <p className="mt-1 text-sm text-[var(--color-cyan-deep)]">{item.place}</p>
                  <p className="mt-2 text-sm text-[var(--color-mist)]">{item.period}</p>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
        <div className="rounded-[34px] border border-[var(--color-line)] bg-[var(--color-paper)] p-7 shadow-[0_22px_52px_rgba(36,53,51,0.06)]">
          <p className="text-xs uppercase tracking-[0.28em] text-[var(--color-wood)]">
            About Dr. Deepti Sinha
          </p>
          <h2 className="mt-3 font-serif text-3xl text-[var(--color-ink)]">
            ENT care grounded in experience, clarity, and evidence-based treatment.
          </h2>
          <p className="mt-4 text-sm leading-8 text-[var(--color-mist)]">
            {doctor.careStyle}
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            {treatmentHighlights.map((item) => (
              <span
                key={item}
                className="rounded-full border border-[var(--color-line)] bg-[var(--color-paper-soft)] px-4 py-2 text-sm text-[var(--color-ink)]"
              >
                {item}
              </span>
            ))}
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-[24px] bg-[var(--color-cyan-soft)] p-5">
              <p className="text-xs uppercase tracking-[0.22em] text-[var(--color-cyan-deep)]">
                Education
              </p>
              <ul className="mt-3 space-y-3 text-sm leading-6 text-[var(--color-ink)]">
                {doctor.education.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="rounded-[24px] bg-[rgba(138,102,72,0.08)] p-5">
              <p className="text-xs uppercase tracking-[0.22em] text-[var(--color-wood-deep)]">
                International exposure
              </p>
              <ul className="mt-3 space-y-3 text-sm leading-6 text-[var(--color-ink)]">
                {doctor.internationalExposure.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {doctor.skills.slice(0, 6).map((skill) => (
            <article
              key={skill}
              className="rounded-[28px] border border-[var(--color-line)] bg-[linear-gradient(145deg,var(--color-paper),#fbfffe)] p-5 shadow-[0_18px_40px_rgba(36,53,51,0.04)]"
            >
              <p className="text-xs uppercase tracking-[0.22em] text-[var(--color-cyan-deep)]">
                Clinical strength
              </p>
              <h3 className="mt-3 text-lg font-semibold text-[var(--color-ink)]">{skill}</h3>
              <p className="mt-3 text-sm leading-7 text-[var(--color-mist)]">
                Part of a practice shaped by long-term hospital experience, interdisciplinary care,
                and strong surgical and non-surgical judgment.
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.06fr_0.94fr]">
        <div className="rounded-[34px] border border-[var(--color-line)] bg-[var(--color-paper)] p-7 shadow-[0_22px_52px_rgba(36,53,51,0.05)]">
          <p className="text-xs uppercase tracking-[0.28em] text-[var(--color-wood)]">
            Career timeline
          </p>
          <div className="mt-5 space-y-5">
            {doctor.timeline.map((item) => (
              <article
                key={`${item.title}-${item.place}`}
                className="rounded-[24px] border border-[var(--color-line)] bg-[var(--color-paper-soft)] p-5"
              >
                <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-[var(--color-ink)]">{item.title}</h3>
                    <p className="mt-1 text-sm text-[var(--color-cyan-deep)]">{item.place}</p>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-xs uppercase tracking-[0.2em] text-[var(--color-wood)]">
                    {item.period}
                  </span>
                </div>
                <ul className="mt-4 space-y-2 text-sm leading-7 text-[var(--color-mist)]">
                  {item.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-[32px] border border-[var(--color-line)] bg-[linear-gradient(145deg,#fefcf8,#f7fbfa)] p-6 shadow-[0_20px_48px_rgba(36,53,51,0.05)]">
            <p className="text-xs uppercase tracking-[0.28em] text-[var(--color-wood)]">
              Recognition and publications
            </p>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-[var(--color-mist)]">
              {doctor.awards.map((item) => (
                <li key={item}>{item}</li>
              ))}
              {doctor.publications.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-[32px] border border-[var(--color-line)] bg-[linear-gradient(145deg,#eef7f5,#fffdf9)] p-6 shadow-[0_20px_48px_rgba(36,53,51,0.05)]">
            <p className="text-xs uppercase tracking-[0.28em] text-[var(--color-wood)]">
              Languages
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {doctor.languages.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-[var(--color-line)] bg-[var(--color-paper)] px-4 py-2 text-sm text-[var(--color-ink)]"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-[32px] border border-[var(--color-line)] bg-[linear-gradient(145deg,#fefcf8,#fff)] p-6 shadow-[0_20px_48px_rgba(36,53,51,0.05)]">
            <p className="text-xs uppercase tracking-[0.28em] text-[var(--color-wood)]">
              Contact
            </p>
            <p className="mt-3 text-sm leading-7 text-[var(--color-mist)]">
              {doctor.professionalTitle} at {doctor.currentPractice}.
            </p>
            <a
              className="mt-4 inline-flex rounded-full bg-[var(--color-cyan-deep)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--color-cyan)]"
              href={`mailto:${doctor.email}`}
            >
              Email Dr. Deepti Sinha
            </a>
          </div>
        </div>
      </section>

      <section id="patient-guidance" className="space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-wood)]">
              Patient guidance
            </p>
            <h2 className="mt-2 font-serif text-3xl text-[var(--color-ink)]">
              Practical ENT advice framed for the general public.
            </h2>
          </div>
          <Link className="text-sm font-semibold text-[var(--color-cyan-deep)] transition hover:text-[var(--color-wood-deep)]" to={doctor.appointmentLink}>
            Book a consultation
          </Link>
        </div>

        <article className="rounded-[36px] border border-[var(--color-line)] bg-[linear-gradient(145deg,var(--color-paper),#f7fbfa)] p-7 shadow-[0_24px_60px_rgba(36,53,51,0.06)] md:p-8">
          <p className="text-xs uppercase tracking-[0.28em] text-[var(--color-cyan-deep)]">
            Featured ear-health note
          </p>
          <h3 className="mt-3 font-serif text-3xl text-[var(--color-ink)]">
            {featuredAdvice.title}
          </h3>
          <p className="mt-4 max-w-4xl text-sm leading-8 text-[var(--color-mist)]">
            {featuredAdvice.summary}
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {featuredAdvice.bullets.map((item) => (
              <div
                key={item}
                className="rounded-[24px] border border-[var(--color-line)] bg-[var(--color-paper-soft)] p-5"
              >
                <p className="text-sm leading-7 text-[var(--color-ink)]">{item}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-[26px] bg-[rgba(138,102,72,0.08)] p-5">
            <p className="text-xs uppercase tracking-[0.22em] text-[var(--color-wood-deep)]">
              Good ear-health habits
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {featuredAdvice.tips.map((tip) => (
                <span
                  key={tip}
                  className="rounded-full border border-[rgba(138,102,72,0.18)] bg-white px-4 py-2 text-sm text-[var(--color-ink)]"
                >
                  {tip}
                </span>
              ))}
            </div>
          </div>
        </article>

        <div className="grid gap-4 lg:grid-cols-2">
          {supportingAdvice.map((item) => (
            <article
              key={item.title}
              className="rounded-[32px] border border-[var(--color-line)] bg-[var(--color-paper)] p-6 shadow-[0_20px_48px_rgba(36,53,51,0.05)]"
            >
              <p className="text-xs uppercase tracking-[0.22em] text-[var(--color-wood)]">
                Advice for daily life
              </p>
              <h3 className="mt-3 text-2xl font-semibold text-[var(--color-ink)]">{item.title}</h3>
              <p className="mt-4 text-sm leading-7 text-[var(--color-mist)]">{item.summary}</p>

              <ul className="mt-5 space-y-3 text-sm leading-7 text-[var(--color-ink)]">
                {item.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>

              <div className="mt-5 flex flex-wrap gap-2">
                {item.tips.map((tip) => (
                  <span
                    key={tip}
                    className="rounded-full bg-[var(--color-cyan-soft)] px-3 py-1.5 text-xs font-medium text-[var(--color-cyan-deep)]"
                  >
                    {tip}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-[36px] border border-[var(--color-line)] bg-[linear-gradient(145deg,#eef7f5,#f9f5ef)] p-7 shadow-[0_22px_52px_rgba(36,53,51,0.05)] md:p-10">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-wood)]">
              Consultation access
            </p>
            <h2 className="mt-3 font-serif text-3xl text-[var(--color-ink)]">
              Review the doctor, understand the care style, then book with clarity.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--color-mist)]">
              This redesign now looks and feels closer to a private hospital microsite, while
              still keeping the booking pipeline simple for patients.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              className="inline-flex items-center justify-center rounded-full bg-[var(--color-cyan-deep)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-cyan)]"
              to={doctor.appointmentLink}
            >
              Book appointment
            </Link>
            <Link
              className="inline-flex items-center justify-center rounded-full border border-[rgba(138,102,72,0.26)] bg-white px-6 py-3 text-sm font-semibold text-[var(--color-wood-deep)] transition hover:bg-[var(--color-wood-soft)]"
              to={doctor.id ? `/doctors/${doctor.id}` : "/book"}
            >
              View full doctor profile
            </Link>
          </div>
        </div>

        {error ? (
          <div className="mt-6 rounded-[22px] border border-[rgba(164,79,79,0.18)] bg-[rgba(164,79,79,0.08)] px-4 py-3 text-sm text-[var(--color-danger)]">
            Availability sync note: {error}
          </div>
        ) : null}
      </section>
    </div>
  );
}
