import { useEffect } from "react";
import { Link } from "react-router-dom";

import { useBooking } from "../hooks/useBooking";
import { formatShortDate } from "../utils/formatters";
import { getPrimaryDoctorProfile } from "../utils/doctorProfiles";
import { doctorProfileImage, recognitionHighlights, recognitionPreview } from "../utils/mediaGallery";

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
  const featuredTimeline = doctor.timeline.slice(0, 3);
  const featuredSkills = doctor.skills.slice(0, 4);

  return (
    <div className="space-y-6 py-4 sm:space-y-8 sm:py-6 lg:py-8">
      <section className="grid gap-4 xl:grid-cols-[1.08fr_0.92fr]">
        <div className="rounded-[28px] border border-[var(--color-line)] bg-[linear-gradient(145deg,var(--color-paper),#f8fcfb)] p-5 shadow-[0_24px_60px_rgba(36,53,51,0.08)] sm:p-7 lg:p-8">
          <p className="text-[11px] uppercase tracking-[0.3em] text-[var(--color-wood)]">
            Lead Consultant ENT Surgeon
          </p>

          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start">
            <img
              alt={doctor.name}
              className="h-28 w-24 rounded-[24px] object-cover object-top shadow-[0_16px_32px_rgba(36,53,51,0.12)] sm:h-36 sm:w-28"
              src={doctorProfileImage}
            />

            <div className="min-w-0">
              <h1 className="font-serif text-3xl leading-tight text-[var(--color-ink)] sm:text-5xl">
                {doctor.name}
              </h1>

              <p className="mt-4 text-sm font-semibold leading-7 text-[var(--color-cyan-deep)] sm:text-base">
                {doctor.credentials}
              </p>

              <p className="mt-2 text-sm font-medium leading-7 text-[var(--color-wood-deep)] sm:text-base">
                {doctor.headline}
              </p>
            </div>
          </div>

          <p className="mt-5 text-sm leading-7 text-[var(--color-mist)] sm:text-base sm:leading-8">
            {doctor.summary} {doctor.mission}
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-[22px] bg-[var(--color-cyan-soft)] px-4 py-4">
              <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--color-cyan-deep)]">
                Current hospital
              </p>
              <p className="mt-2 text-sm font-semibold leading-6 text-[var(--color-ink)]">
                {doctor.currentPractice}
              </p>
            </div>

            <div className="rounded-[22px] bg-[var(--color-paper-soft)] px-4 py-4">
              <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--color-wood)]">
                Location
              </p>
              <p className="mt-2 text-sm font-semibold leading-6 text-[var(--color-ink)]">
                {doctor.location}
              </p>
            </div>

            <a
              className="break-all rounded-[22px] bg-[var(--color-paper-soft)] px-4 py-4 text-sm font-semibold leading-6 text-[var(--color-cyan-deep)] transition hover:bg-[var(--color-wood-soft)] sm:col-span-2"
              href={`mailto:${doctor.email}`}
            >
              {doctor.email}
            </a>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              className="inline-flex w-full items-center justify-center rounded-full bg-[var(--color-cyan-deep)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-cyan)] sm:w-auto"
              to={doctor.appointmentLink}
            >
              Book an appointment
            </Link>
            <Link
              className="inline-flex w-full items-center justify-center rounded-full border border-[rgba(138,102,72,0.26)] bg-[var(--color-paper-soft)] px-6 py-3 text-sm font-semibold text-[var(--color-wood-deep)] transition hover:bg-[var(--color-wood-soft)] sm:w-auto"
              to={doctor.id ? `/doctors/${doctor.id}` : "/doctors/1"}
            >
              View doctor profile
            </Link>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {doctor.quickFacts.map((fact) => (
              <div
                key={fact.label}
                className="rounded-[22px] border border-[var(--color-line)] bg-[var(--color-paper-soft)] p-4"
              >
                <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--color-wood)]">
                  {fact.label}
                </p>
                <p className="mt-3 text-xl font-semibold text-[var(--color-ink)] sm:text-2xl">
                  {fact.value}
                </p>
                <p className="mt-2 text-sm leading-6 text-[var(--color-mist)]">
                  {fact.detail}
                </p>
              </div>
            ))}
          </div>
        </div>

        <aside className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
          <div className="rounded-[26px] border border-[var(--color-line)] bg-[linear-gradient(145deg,#eef7f5,var(--color-paper))] p-5 shadow-[0_20px_48px_rgba(36,53,51,0.06)] sm:p-6">
            <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--color-wood)]">
              Current availability
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-[var(--color-ink)]">
              Calm booking from a single specialist profile
            </h2>
            <p className="mt-3 text-sm leading-7 text-[var(--color-mist)]">
              Patients can review the doctor, understand the clinic focus, and then choose a time
              without navigating a crowded multi-doctor portal.
            </p>

            <div className="mt-5 rounded-[22px] border border-[var(--color-line)] bg-[var(--color-paper)] p-4">
              <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--color-cyan-deep)]">
                Next published slot
              </p>
              <p className="mt-2 text-lg font-semibold text-[var(--color-ink)] sm:text-xl">
                {loadingDoctors
                  ? "Syncing schedule..."
                  : formatShortDate(doctor.next_available_date)}
              </p>
              <p className="mt-2 text-sm leading-6 text-[var(--color-mist)]">
                {doctor.open_slot_count} open future slots currently visible in the booking flow.
              </p>
            </div>
          </div>

          <div className="rounded-[26px] border border-[var(--color-line)] bg-[linear-gradient(145deg,#fffdf9,#f8f2ea)] p-5 shadow-[0_20px_48px_rgba(36,53,51,0.05)] sm:p-6">
            <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--color-wood)]">
              Treatment focus
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {treatmentHighlights.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-[rgba(138,102,72,0.18)] bg-white px-3 py-1.5 text-xs text-[var(--color-ink)]"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </aside>
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.98fr_1.02fr]">
        <div className="rounded-[28px] border border-[var(--color-line)] bg-[var(--color-paper)] p-5 shadow-[0_22px_52px_rgba(36,53,51,0.06)] sm:p-7">
          <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--color-wood)]">
            Why patients book
          </p>
          <h2 className="mt-3 font-serif text-3xl text-[var(--color-ink)]">
            Breathing, sinus, allergy, ear, and vertigo concerns handled with specialist-led care.
          </h2>
          <ul className="mt-5 space-y-3">
            {doctor.whyBookNow.slice(0, 4).map((item) => (
              <li
                key={item}
                className="rounded-[20px] border border-[var(--color-line)] bg-[var(--color-paper-soft)] px-4 py-4 text-sm leading-7 text-[var(--color-ink)]"
              >
                {item}
              </li>
            ))}
          </ul>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              className="inline-flex w-full items-center justify-center rounded-full bg-[var(--color-cyan-deep)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-cyan)] sm:w-auto"
              to={doctor.appointmentLink}
            >
              Book with Dr. Deepti Sinha
            </Link>
            <a
              className="inline-flex w-full items-center justify-center rounded-full border border-[rgba(138,102,72,0.26)] bg-[var(--color-paper-soft)] px-6 py-3 text-sm font-semibold text-[var(--color-wood-deep)] transition hover:bg-[var(--color-wood-soft)] sm:w-auto"
              href="#patient-guidance"
            >
              Read patient guidance
            </a>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {featuredSkills.map((skill) => (
            <article
              key={skill}
              className="rounded-[24px] border border-[var(--color-line)] bg-[linear-gradient(145deg,var(--color-paper),#fbfffe)] p-5 shadow-[0_18px_40px_rgba(36,53,51,0.04)]"
            >
              <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--color-cyan-deep)]">
                Clinical strength
              </p>
              <h3 className="mt-3 text-lg font-semibold text-[var(--color-ink)]">{skill}</h3>
              <p className="mt-3 text-sm leading-7 text-[var(--color-mist)]">
                Hospital-based ENT care shaped by long-term consultant experience and clear
                treatment planning.
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.02fr_0.98fr]">
        <div className="rounded-[28px] border border-[var(--color-line)] bg-[var(--color-paper)] p-5 shadow-[0_22px_52px_rgba(36,53,51,0.05)] sm:p-7">
          <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--color-wood)]">
            Professional background
          </p>
          <h2 className="mt-3 font-serif text-3xl text-[var(--color-ink)]">
            A concise view of hospital experience before you go deeper into the full profile.
          </h2>

          <div className="mt-5 space-y-4">
            {featuredTimeline.map((item) => (
              <article
                key={`${item.title}-${item.place}`}
                className="rounded-[22px] border border-[var(--color-line)] bg-[var(--color-paper-soft)] p-4"
              >
                <div className="flex flex-col gap-2">
                  <div>
                    <h3 className="text-base font-semibold text-[var(--color-ink)] sm:text-lg">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-sm text-[var(--color-cyan-deep)]">{item.place}</p>
                  </div>
                  <span className="inline-flex self-start rounded-full bg-white px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-[var(--color-wood)]">
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

          <Link
            className="mt-6 inline-flex items-center text-sm font-semibold text-[var(--color-cyan-deep)] transition hover:text-[var(--color-wood-deep)]"
            to={doctor.id ? `/doctors/${doctor.id}` : "/doctors/1"}
          >
            Open full doctor profile
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-[24px] border border-[var(--color-line)] bg-[linear-gradient(145deg,#eef7f5,#fff)] p-5 shadow-[0_20px_48px_rgba(36,53,51,0.05)]">
            <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--color-wood)]">
              Education
            </p>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-[var(--color-mist)]">
              {doctor.education.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-[24px] border border-[var(--color-line)] bg-[linear-gradient(145deg,#fffdf9,#f8f2ea)] p-5 shadow-[0_20px_48px_rgba(36,53,51,0.05)]">
            <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--color-wood)]">
              International exposure
            </p>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-[var(--color-mist)]">
              {doctor.internationalExposure.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-[24px] border border-[var(--color-line)] bg-[linear-gradient(145deg,#fefcf8,#fff)] p-5 shadow-[0_20px_48px_rgba(36,53,51,0.05)] sm:col-span-2">
            <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--color-wood)]">
              Recognition and communication
            </p>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-[var(--color-mist)]">
              {doctor.awards.map((item) => (
                <li key={item}>{item}</li>
              ))}
              {doctor.publications.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>

            <div className="mt-5 flex flex-wrap gap-2">
              {doctor.languages.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-[var(--color-line)] bg-[var(--color-paper)] px-4 py-2 text-xs text-[var(--color-ink)]"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.96fr_1.04fr]">
        <div className="rounded-[28px] border border-[var(--color-line)] bg-[linear-gradient(145deg,#eef7f5,#fff)] p-5 shadow-[0_22px_52px_rgba(36,53,51,0.05)] sm:p-7">
          <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--color-wood)]">
            Trust and recognition
          </p>
          <h2 className="mt-3 font-serif text-3xl text-[var(--color-ink)]">
            Patient reviews, conference highlights, and recognitions placed without clutter.
          </h2>
          <p className="mt-4 text-sm leading-7 text-[var(--color-mist)]">
            These visual proof points now have their own dedicated place in the experience, so the
            main booking journey stays clean on mobile while patients can still explore credibility
            signals when they want more reassurance.
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {recognitionHighlights.map((item) => (
              <div
                key={item.label}
                className="rounded-[22px] border border-[var(--color-line)] bg-white p-4"
              >
                <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--color-wood)]">
                  {item.label}
                </p>
                <p className="mt-3 text-sm font-semibold leading-6 text-[var(--color-ink)]">
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          <Link
            className="mt-6 inline-flex items-center text-sm font-semibold text-[var(--color-cyan-deep)] transition hover:text-[var(--color-wood-deep)]"
            to="/recognition"
          >
            Open recognition gallery
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {recognitionPreview.map((item) => (
            <article
              key={item.src}
              className="rounded-[24px] border border-[var(--color-line)] bg-[var(--color-paper)] p-3 shadow-[0_18px_40px_rgba(36,53,51,0.05)]"
            >
              <div className="overflow-hidden rounded-[18px] border border-[var(--color-line)] bg-white">
                <img
                  alt={item.title}
                  className={`h-[210px] w-full ${item.fit === "contain" ? "object-contain bg-[var(--color-paper-soft)] p-2" : "object-cover object-center"}`}
                  loading="lazy"
                  src={item.src}
                />
              </div>
              <p className="mt-4 text-[11px] uppercase tracking-[0.22em] text-[var(--color-wood)]">
                {item.eyebrow}
              </p>
              <p className="mt-2 text-sm font-semibold text-[var(--color-ink)]">{item.title}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="patient-guidance" className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-[var(--color-wood)]">
              Patient guidance
            </p>
            <h2 className="mt-2 font-serif text-3xl text-[var(--color-ink)]">
              Practical ENT advice framed for the general public.
            </h2>
          </div>
          <Link
            className="text-sm font-semibold text-[var(--color-cyan-deep)] transition hover:text-[var(--color-wood-deep)]"
            to={doctor.appointmentLink}
          >
            Book a consultation
          </Link>
        </div>

        <article className="rounded-[28px] border border-[var(--color-line)] bg-[linear-gradient(145deg,var(--color-paper),#f7fbfa)] p-5 shadow-[0_24px_60px_rgba(36,53,51,0.06)] sm:p-7">
          <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--color-cyan-deep)]">
            Featured ear-health note
          </p>
          <h3 className="mt-3 font-serif text-3xl text-[var(--color-ink)]">
            {featuredAdvice.title}
          </h3>
          <p className="mt-4 text-sm leading-7 text-[var(--color-mist)] sm:leading-8">
            {featuredAdvice.summary}
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {featuredAdvice.bullets.map((item) => (
              <div
                key={item}
                className="rounded-[22px] border border-[var(--color-line)] bg-[var(--color-paper-soft)] p-4"
              >
                <p className="text-sm leading-7 text-[var(--color-ink)]">{item}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-[24px] bg-[rgba(138,102,72,0.08)] p-4 sm:p-5">
            <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--color-wood-deep)]">
              Good ear-health habits
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {featuredAdvice.tips.map((tip) => (
                <span
                  key={tip}
                  className="rounded-full border border-[rgba(138,102,72,0.18)] bg-white px-4 py-2 text-xs text-[var(--color-ink)]"
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
              className="rounded-[26px] border border-[var(--color-line)] bg-[var(--color-paper)] p-5 shadow-[0_20px_48px_rgba(36,53,51,0.05)] sm:p-6"
            >
              <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--color-wood)]">
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

      <section className="rounded-[28px] border border-[var(--color-line)] bg-[linear-gradient(145deg,#eef7f5,#f9f5ef)] p-5 shadow-[0_22px_52px_rgba(36,53,51,0.05)] sm:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-[var(--color-wood)]">
              Consultation access
            </p>
            <h2 className="mt-3 font-serif text-3xl text-[var(--color-ink)]">
              Review the doctor, understand the care style, then book with clarity.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--color-mist)]">
              The experience now reads like a professional hospital microsite on mobile first,
              while still keeping the booking pipeline direct and easy for patients.
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Link
              className="inline-flex w-full items-center justify-center rounded-full bg-[var(--color-cyan-deep)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-cyan)] sm:w-auto"
              to={doctor.appointmentLink}
            >
              Book appointment
            </Link>
            <Link
              className="inline-flex w-full items-center justify-center rounded-full border border-[rgba(138,102,72,0.26)] bg-white px-6 py-3 text-sm font-semibold text-[var(--color-wood-deep)] transition hover:bg-[var(--color-wood-soft)] sm:w-auto"
              to={doctor.id ? `/doctors/${doctor.id}` : "/doctors/1"}
            >
              View full doctor profile
            </Link>
          </div>
        </div>

        {error ? (
          <div className="mt-6 rounded-[20px] border border-[rgba(164,79,79,0.18)] bg-[rgba(164,79,79,0.08)] px-4 py-3 text-sm text-[var(--color-danger)]">
            Availability sync note: {error}
          </div>
        ) : null}
      </section>
    </div>
  );
}
