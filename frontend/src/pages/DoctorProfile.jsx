import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";

import { useBooking } from "../hooks/useBooking";
import { formatDateLabel } from "../utils/formatters";
import { getDoctorProfileContent } from "../utils/doctorProfiles";

export default function DoctorProfile() {
  const { doctorId } = useParams();
  const { doctors, loadDoctors, loadingDoctors } = useBooking();

  useEffect(() => {
    loadDoctors().catch(() => {});
  }, [loadDoctors]);

  const matchedDoctor = doctors.find((item) => item.id === Number(doctorId));
  const doctor = getDoctorProfileContent(matchedDoctor);

  return (
    <div className="space-y-8 py-6 md:py-10">
      <Link
        className="text-sm font-semibold text-[var(--color-cyan-deep)] transition hover:text-[var(--color-wood-deep)]"
        to="/"
      >
        Back to home
      </Link>

      <section className="grid gap-6 lg:grid-cols-[1.04fr_0.96fr]">
        <div className="rounded-[36px] border border-[var(--color-line)] bg-[linear-gradient(145deg,var(--color-paper),#f8fcfb)] p-7 shadow-[0_24px_60px_rgba(36,53,51,0.08)] md:p-10">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-wood)]">
            ENT consultation profile
          </p>

          <div className="mt-5 flex flex-wrap items-start gap-5">
            <div className="flex h-20 w-20 items-center justify-center rounded-[26px] bg-[linear-gradient(135deg,var(--color-cyan),var(--color-cyan-deep))] text-2xl font-semibold text-white shadow-[0_18px_36px_rgba(45,124,119,0.18)]">
              {doctor.initials}
            </div>

            <div className="max-w-3xl">
              <h1 className="font-serif text-4xl text-[var(--color-ink)]">{doctor.name}</h1>
              <p className="mt-2 text-lg font-semibold text-[var(--color-cyan-deep)]">
                {doctor.professionalTitle} at {doctor.currentPracticeShort}
              </p>
              <p className="mt-2 text-sm leading-7 text-[var(--color-mist)]">
                {doctor.credentials} | {doctor.headline}
              </p>
            </div>
          </div>

          <p className="mt-6 max-w-3xl text-base leading-8 text-[var(--color-mist)]">
            {doctor.summary} {doctor.mission}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              className="inline-flex items-center justify-center rounded-full bg-[var(--color-cyan-deep)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-cyan)]"
              to={doctor.appointmentLink}
            >
              Book an appointment
            </Link>
            <a
              className="inline-flex items-center justify-center rounded-full border border-[rgba(138,102,72,0.26)] bg-[var(--color-paper-soft)] px-6 py-3 text-sm font-semibold text-[var(--color-wood-deep)] transition hover:bg-[var(--color-wood-soft)]"
              href="#doctor-background"
            >
              View doctor background
            </a>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-[24px] border border-[var(--color-line)] bg-[var(--color-paper-soft)] p-5">
              <p className="text-xs uppercase tracking-[0.22em] text-[var(--color-wood)]">
                Current hospital
              </p>
              <p className="mt-3 text-lg font-semibold text-[var(--color-ink)]">
                {doctor.currentPracticeShort}
              </p>
            </div>

            <div className="rounded-[24px] border border-[var(--color-line)] bg-[var(--color-paper-soft)] p-5">
              <p className="text-xs uppercase tracking-[0.22em] text-[var(--color-wood)]">
                Next available
              </p>
              <p className="mt-3 text-lg font-semibold text-[var(--color-ink)]">
                {loadingDoctors
                  ? "Syncing..."
                  : doctor.next_available_date
                    ? formatDateLabel(doctor.next_available_date)
                    : "Schedule coming soon"}
              </p>
            </div>

            <div className="rounded-[24px] border border-[var(--color-line)] bg-[var(--color-paper-soft)] p-5">
              <p className="text-xs uppercase tracking-[0.22em] text-[var(--color-wood)]">
                Contact
              </p>
              <a
                className="mt-3 block break-all text-base font-semibold leading-7 text-[var(--color-cyan-deep)] transition hover:text-[var(--color-wood-deep)]"
                href={`mailto:${doctor.email}`}
              >
                {doctor.email}
              </a>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-[32px] border border-[var(--color-line)] bg-[linear-gradient(145deg,#eef7f5,var(--color-paper))] p-6 shadow-[0_20px_48px_rgba(36,53,51,0.05)]">
            <p className="text-xs uppercase tracking-[0.28em] text-[var(--color-wood)]">
              When patients should consider booking
            </p>
            <div className="mt-4 space-y-3">
              {doctor.bookingReasons.map((item) => (
                <div
                  key={item}
                  className="rounded-[20px] border border-[var(--color-line)] bg-white px-4 py-4 text-sm leading-7 text-[var(--color-ink)]"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[32px] border border-[var(--color-line)] bg-[linear-gradient(145deg,#fffdf9,#f8f2ea)] p-6 shadow-[0_20px_48px_rgba(36,53,51,0.05)]">
            <p className="text-xs uppercase tracking-[0.28em] text-[var(--color-wood)]">
              Why patients book here
            </p>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-[var(--color-mist)]">
              {doctor.whyBookNow.map((item) => (
                <li
                  key={item}
                  className="rounded-[20px] border border-[rgba(138,102,72,0.18)] bg-white/80 px-4 py-3 text-[var(--color-ink)]"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.96fr_1.04fr]">
        <div className="rounded-[34px] border border-[var(--color-line)] bg-[var(--color-paper)] p-7 shadow-[0_22px_52px_rgba(36,53,51,0.05)]">
          <p className="text-xs uppercase tracking-[0.28em] text-[var(--color-wood)]">
            What this consultation helps with
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {doctor.focusAreas.map((item) => (
              <span
                key={item}
                className="rounded-full border border-[var(--color-line)] bg-[var(--color-cyan-soft)] px-4 py-2 text-sm text-[var(--color-cyan-deep)]"
              >
                {item}
              </span>
            ))}
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {doctor.bookingJourney.map((item, index) => (
              <article
                key={item}
                className="rounded-[24px] border border-[var(--color-line)] bg-[var(--color-paper-soft)] p-5"
              >
                <p className="text-2xl font-serif text-[var(--color-wood)]">0{index + 1}</p>
                <p className="mt-3 text-sm leading-7 text-[var(--color-ink)]">{item}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="rounded-[34px] border border-[var(--color-line)] bg-[linear-gradient(145deg,#fefcf8,#fff)] p-7 shadow-[0_22px_52px_rgba(36,53,51,0.05)]">
          <p className="text-xs uppercase tracking-[0.28em] text-[var(--color-wood)]">
            Clinical approach
          </p>
          <h2 className="mt-3 font-serif text-3xl text-[var(--color-ink)]">
            Evidence-based ENT care with emphasis on long-term breathing, sinus, and ear health.
          </h2>
          <p className="mt-4 text-sm leading-8 text-[var(--color-mist)]">
            {doctor.careStyle}
          </p>
          <ul className="mt-5 space-y-3 text-sm leading-7 text-[var(--color-ink)]">
            {doctor.expectations.map((item) => (
              <li
                key={item}
                className="rounded-[20px] border border-[var(--color-line)] bg-white px-4 py-3"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="doctor-background" className="grid gap-6 lg:grid-cols-[1.02fr_0.98fr]">
        <div className="rounded-[34px] border border-[var(--color-line)] bg-[var(--color-paper)] p-7 shadow-[0_22px_52px_rgba(36,53,51,0.05)]">
          <p className="text-xs uppercase tracking-[0.28em] text-[var(--color-wood)]">
            Doctor background
          </p>
          <div className="mt-5 space-y-5">
            {doctor.timeline.map((item) => (
              <article
                key={`${item.title}-${item.place}`}
                className="rounded-[24px] border border-[var(--color-line)] bg-[var(--color-paper-soft)] p-5"
              >
                <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-[var(--color-ink)]">{item.title}</h2>
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

        <div className="space-y-5">
          <div className="rounded-[32px] border border-[var(--color-line)] bg-[linear-gradient(145deg,#fefcf8,#fff)] p-6 shadow-[0_20px_48px_rgba(36,53,51,0.05)]">
            <p className="text-xs uppercase tracking-[0.28em] text-[var(--color-wood)]">
              Education
            </p>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-[var(--color-mist)]">
              {doctor.education.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-[32px] border border-[var(--color-line)] bg-[linear-gradient(145deg,#eef7f5,#fff)] p-6 shadow-[0_20px_48px_rgba(36,53,51,0.05)]">
            <p className="text-xs uppercase tracking-[0.28em] text-[var(--color-wood)]">
              International exposure
            </p>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-[var(--color-mist)]">
              {doctor.internationalExposure.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-[32px] border border-[var(--color-line)] bg-[linear-gradient(145deg,#fffdf9,#f8f2ea)] p-6 shadow-[0_20px_48px_rgba(36,53,51,0.05)]">
            <p className="text-xs uppercase tracking-[0.28em] text-[var(--color-wood)]">
              Awards, skills, and publications
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {doctor.skills.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-[rgba(138,102,72,0.18)] bg-white px-3 py-1.5 text-xs text-[var(--color-ink)]"
                >
                  {item}
                </span>
              ))}
            </div>
            <ul className="mt-5 space-y-3 text-sm leading-7 text-[var(--color-mist)]">
              {doctor.awards.map((item) => (
                <li key={item}>{item}</li>
              ))}
              {doctor.publications.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
