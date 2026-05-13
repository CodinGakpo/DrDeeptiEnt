import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { FaMapMarkerAlt } from "react-icons/fa";

import { useBooking } from "../hooks/useBooking";
import { formatDateLabel } from "../utils/formatters";
import { getDoctorProfileContent } from "../utils/doctorProfiles";
import { doctorProfileImage, recognitionHighlights } from "../utils/mediaGallery";

export default function DoctorProfile() {
  const { doctorId } = useParams();
  const { doctors, loadDoctors, loadingDoctors } = useBooking();

  useEffect(() => {
    loadDoctors().catch(() => {});
  }, [loadDoctors]);

  const matchedDoctor = doctors.find((item) => item.id === Number(doctorId));
  const doctor = getDoctorProfileContent(matchedDoctor);

  return (
    <div className="space-y-6 py-4 sm:space-y-8 sm:py-6 lg:py-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          className="text-sm font-semibold text-[var(--color-cyan-deep)] transition hover:text-[var(--color-wood-deep)]"
          to="/"
        >
          Back to home
        </Link>
        <span className="inline-flex self-start rounded-full border border-[var(--color-line)] bg-[var(--color-paper-soft)] px-4 py-2 text-[11px] uppercase tracking-[0.22em] text-[var(--color-wood)]">
          {loadingDoctors
            ? "Syncing schedule"
            : doctor.next_available_date
              ? `Next ${formatDateLabel(doctor.next_available_date)}`
              : "Schedule updates soon"}
        </span>
      </div>

      <section className="grid gap-4 xl:grid-cols-[1.04fr_0.96fr]">
        <div className="rounded-[28px] border border-[var(--color-line)] bg-[linear-gradient(145deg,var(--color-paper),#f8fcfb)] p-5 shadow-[0_24px_60px_rgba(36,53,51,0.08)] sm:p-7 lg:p-8">
          <p className="text-[11px] uppercase tracking-[0.3em] text-[var(--color-wood)]">
            ENT consultation profile
          </p>

          <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-start">
            <img
              alt={doctor.name}
              className="h-32 w-28 rounded-[24px] object-cover object-top shadow-[0_18px_36px_rgba(36,53,51,0.12)] sm:h-40 sm:w-32"
              src={doctorProfileImage}
            />

            <div className="min-w-0">
              <h1 className="font-serif text-3xl leading-tight text-[var(--color-ink)] sm:text-5xl">
                {doctor.name}
              </h1>
              <p className="mt-3 text-base font-semibold leading-7 text-[var(--color-cyan-deep)]">
                {doctor.professionalTitle} at {doctor.currentPracticeShort}
              </p>
              <p className="mt-2 text-sm leading-7 text-[var(--color-mist)] sm:text-base">
                {doctor.credentials} | {doctor.headline}
              </p>
            </div>
          </div>

          <p className="mt-6 text-sm leading-7 text-[var(--color-mist)] sm:text-base sm:leading-8">
            {doctor.summary} {doctor.mission}
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-[22px] border border-[var(--color-line)] bg-[var(--color-paper-soft)] p-4">
              <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--color-wood)]">
                Current hospital
              </p>
              <p className="mt-2 text-sm font-semibold leading-6 text-[var(--color-ink)]">
                {doctor.currentPracticeShort}
              </p>
              <a
                className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-cyan-deep)] transition hover:text-[var(--color-wood-deep)]"
                href={doctor.currentPracticeMapUrl}
                rel="noreferrer"
                target="_blank"
              >
                <FaMapMarkerAlt aria-hidden="true" />
                Open in Google Maps
              </a>
            </div>

            <div className="rounded-[22px] border border-[var(--color-line)] bg-[var(--color-paper-soft)] p-4">
              <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--color-wood)]">
                Location
              </p>
              <p className="mt-2 text-sm font-semibold leading-6 text-[var(--color-ink)]">
                {doctor.location}
              </p>
            </div>

            <div className="rounded-[22px] border border-[var(--color-line)] bg-[var(--color-paper-soft)] p-4 sm:col-span-2 lg:col-span-1">
              <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--color-wood)]">
                Contact
              </p>
              <a
                className="mt-2 block break-all text-sm font-semibold leading-7 text-[var(--color-cyan-deep)] transition hover:text-[var(--color-wood-deep)]"
                href={`mailto:${doctor.email}`}
              >
                {doctor.email}
              </a>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              className="inline-flex w-full items-center justify-center rounded-full bg-[var(--color-cyan-deep)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-cyan)] sm:w-auto"
              to={doctor.appointmentLink}
            >
              Book an appointment
            </Link>
            <a
              className="inline-flex w-full items-center justify-center rounded-full border border-[rgba(138,102,72,0.26)] bg-[var(--color-paper-soft)] px-6 py-3 text-sm font-semibold text-[var(--color-wood-deep)] transition hover:bg-[var(--color-wood-soft)] sm:w-auto"
              href="#doctor-background"
            >
              View doctor background
            </a>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="rounded-[26px] border border-[var(--color-line)] bg-[linear-gradient(145deg,#eef7f5,var(--color-paper))] p-5 shadow-[0_20px_48px_rgba(36,53,51,0.05)] sm:p-6">
            <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--color-wood)]">
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

          <div className="rounded-[26px] border border-[var(--color-line)] bg-[linear-gradient(145deg,#fffdf9,#f8f2ea)] p-5 shadow-[0_20px_48px_rgba(36,53,51,0.05)] sm:p-6">
            <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--color-wood)]">
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

          <div className="rounded-[26px] border border-[var(--color-line)] bg-[linear-gradient(145deg,#f8fcfb,#fff)] p-5 shadow-[0_20px_48px_rgba(36,53,51,0.05)] sm:p-6">
            <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--color-wood)]">
              Recognition snapshot
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {recognitionHighlights.map((item) => (
                <div
                  key={item.label}
                  className="rounded-[18px] border border-[var(--color-line)] bg-white px-3 py-3"
                >
                  <p className="text-[10px] uppercase tracking-[0.22em] text-[var(--color-wood)]">
                    {item.label}
                  </p>
                  <p className="mt-2 text-sm font-semibold leading-6 text-[var(--color-ink)]">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
            <Link
              className="mt-4 inline-flex items-center text-sm font-semibold text-[var(--color-cyan-deep)] transition hover:text-[var(--color-wood-deep)]"
              to="/recognition"
            >
              View testimonials, conferences, and awards
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.98fr_1.02fr]">
        <div className="rounded-[28px] border border-[var(--color-line)] bg-[var(--color-paper)] p-5 shadow-[0_22px_52px_rgba(36,53,51,0.05)] sm:p-7">
          <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--color-wood)]">
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

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {doctor.bookingJourney.map((item, index) => (
              <article
                key={item}
                className="rounded-[22px] border border-[var(--color-line)] bg-[var(--color-paper-soft)] p-4"
              >
                <p className="text-2xl font-serif text-[var(--color-wood)]">0{index + 1}</p>
                <p className="mt-3 text-sm leading-7 text-[var(--color-ink)]">{item}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-[var(--color-line)] bg-[linear-gradient(145deg,#fefcf8,#fff)] p-5 shadow-[0_22px_52px_rgba(36,53,51,0.05)] sm:p-7">
          <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--color-wood)]">
            Clinical approach
          </p>
          <h2 className="mt-3 font-serif text-3xl text-[var(--color-ink)]">
            Evidence-based ENT care with emphasis on long-term breathing, sinus, and ear health.
          </h2>
          <p className="mt-4 text-sm leading-7 text-[var(--color-mist)] sm:leading-8">
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

      <section id="doctor-background" className="grid gap-4 xl:grid-cols-[1.02fr_0.98fr]">
        <div className="rounded-[28px] border border-[var(--color-line)] bg-[var(--color-paper)] p-5 shadow-[0_22px_52px_rgba(36,53,51,0.05)] sm:p-7">
          <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--color-wood)]">
            Doctor background
          </p>
          <div className="mt-5 space-y-4">
            {doctor.timeline.map((item) => (
              <article
                key={`${item.title}-${item.place}`}
                className="rounded-[22px] border border-[var(--color-line)] bg-[var(--color-paper-soft)] p-4"
              >
                <div className="flex flex-col gap-2">
                  <div>
                    <h2 className="text-base font-semibold text-[var(--color-ink)] sm:text-lg">
                      {item.title}
                    </h2>
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
        </div>

        <div className="space-y-4">
          <div className="rounded-[24px] border border-[var(--color-line)] bg-[linear-gradient(145deg,#fefcf8,#fff)] p-5 shadow-[0_20px_48px_rgba(36,53,51,0.05)]">
            <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--color-wood)]">
              Education
            </p>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-[var(--color-mist)]">
              {doctor.education.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-[24px] border border-[var(--color-line)] bg-[linear-gradient(145deg,#eef7f5,#fff)] p-5 shadow-[0_20px_48px_rgba(36,53,51,0.05)]">
            <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--color-wood)]">
              International exposure
            </p>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-[var(--color-mist)]">
              {doctor.internationalExposure.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-[24px] border border-[var(--color-line)] bg-[linear-gradient(145deg,#fffdf9,#f8f2ea)] p-5 shadow-[0_20px_48px_rgba(36,53,51,0.05)]">
            <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--color-wood)]">
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

          <div className="rounded-[24px] border border-[var(--color-line)] bg-[linear-gradient(145deg,#f8fcfb,#fff)] p-5 shadow-[0_20px_48px_rgba(36,53,51,0.05)]">
            <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--color-wood)]">
              Languages
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
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
    </div>
  );
}
