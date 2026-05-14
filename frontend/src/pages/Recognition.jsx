import { Link } from "react-router-dom";

import {
  awards,
  conferences,
  doctorProfileImage,
  recognitionHighlights,
  testimonials,
} from "../utils/mediaGallery";
import { useSeo } from "../seo/useSeo";

function GalleryCard({ item, tone = "paper" }) {
  const toneClass =
    tone === "soft"
      ? "bg-[linear-gradient(145deg,#eef7f5,#ffffff)]"
      : tone === "warm"
        ? "bg-[linear-gradient(145deg,#fffdf9,#f8f2ea)]"
        : "bg-[var(--color-paper)]";

  return (
    <article
      className={`rounded-[24px] border border-[var(--color-line)] p-3 shadow-[0_18px_40px_rgba(36,53,51,0.05)] sm:p-4 ${toneClass}`}
    >
      <div className="overflow-hidden rounded-[18px] border border-[var(--color-line)] bg-white">
        <img
          alt={item.title}
          className={`h-[220px] w-full ${item.fit === "contain" ? "object-contain bg-[var(--color-paper-soft)] p-2" : "object-cover object-center"}`}
          loading="lazy"
          src={item.src}
        />
      </div>
      <p className="mt-4 text-[11px] uppercase tracking-[0.22em] text-[var(--color-wood)]">
        {item.title}
      </p>
      <p className="mt-2 text-sm leading-7 text-[var(--color-mist)]">{item.caption}</p>
    </article>
  );
}

function MarqueeRow({ items, title, tone = "soft", reverse = false }) {
  const toneClass =
    tone === "warm"
      ? "bg-[linear-gradient(145deg,#fffdf9,#f8f2ea)]"
      : "bg-[linear-gradient(145deg,#eef7f5,#ffffff)]";

  const loopItems = [...items, ...items];

  return (
    <div className="space-y-3">
      <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--color-wood)]">{title}</p>
      <div className="overflow-hidden rounded-[24px] border border-[var(--color-line)] bg-white/70 p-3">
        <div
          className={`recognition-marquee-track flex gap-3 ${reverse ? "recognition-marquee-track-reverse" : ""}`}
        >
          {loopItems.map((item, index) => (
            <article
              key={`${item.src}-${index}`}
              className={`w-[260px] shrink-0 rounded-[18px] border border-[var(--color-line)] p-2 shadow-[0_14px_30px_rgba(36,53,51,0.05)] ${toneClass}`}
            >
              <div className="overflow-hidden rounded-[14px] border border-[var(--color-line)] bg-white">
                <img
                  alt={item.title}
                  className={`h-[140px] w-full ${item.fit === "contain" ? "object-contain bg-[var(--color-paper-soft)] p-2" : "object-cover object-center"}`}
                  loading="lazy"
                  src={item.src}
                />
              </div>
              <p className="mt-3 line-clamp-2 text-xs font-semibold leading-5 text-[var(--color-ink)]">
                {item.title}
              </p>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Recognition() {
  useSeo({
    title: "Recognition, Awards, and Testimonials | Dr. Deepti Sinha",
    description:
      "Explore patient testimonials, awards, and conference highlights for Dr. Deepti Sinha ENT clinic.",
    canonical: "https://drdeeptientdelhi.in/recognition",
  });

  return (
    <div className="space-y-6 py-4 sm:space-y-8 sm:py-6 lg:py-8">
      <section className="grid gap-4 xl:grid-cols-[1.02fr_0.98fr]">
        <div className="rounded-[28px] border border-[var(--color-line)] bg-[linear-gradient(145deg,var(--color-paper),#f8fcfb)] p-5 shadow-[0_24px_60px_rgba(36,53,51,0.08)] sm:p-7 lg:p-8">
          <p className="text-[11px] uppercase tracking-[0.3em] text-[var(--color-wood)]">
            Trust and recognition
          </p>
          <h1 className="mt-4 font-serif text-3xl leading-tight text-[var(--color-ink)] sm:text-5xl">
            Patient confidence, conference presence, and recognitions in one place.
          </h1>
          <p className="mt-5 text-sm leading-7 text-[var(--color-mist)] sm:text-base sm:leading-8">
            This page gathers the visual proof behind the clinic story: patient testimonials,
            recognised conference participation, and accolades that reflect long-term trust in Dr.
            Deepti Sinha&apos;s work.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {recognitionHighlights.map((item) => (
              <div
                key={item.label}
                className="rounded-[22px] border border-[var(--color-line)] bg-[var(--color-paper-soft)] p-4"
              >
                <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--color-wood)]">
                  {item.label}
                </p>
                <p className="mt-3 text-lg font-semibold text-[var(--color-ink)]">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              className="inline-flex w-full items-center justify-center rounded-full bg-[var(--color-cyan-deep)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-cyan)] sm:w-auto"
              to="/book"
            >
              Book a visit
            </Link>
            <Link
              className="inline-flex w-full items-center justify-center rounded-full border border-[rgba(138,102,72,0.26)] bg-[var(--color-paper-soft)] px-6 py-3 text-sm font-semibold text-[var(--color-wood-deep)] transition hover:bg-[var(--color-wood-soft)] sm:w-auto"
              to="/doctors/1"
            >
              View doctor profile
            </Link>
          </div>
        </div>

        <div className="overflow-hidden rounded-[28px] border border-[var(--color-line)] bg-[linear-gradient(160deg,#eef7f5,#fff)] shadow-[0_22px_52px_rgba(36,53,51,0.06)]">
          <img
            alt="Dr. Deepti Sinha"
            className="h-full min-h-[320px] w-full object-cover object-top"
            src={doctorProfileImage}
          />
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--color-wood)]">
            Highlights in motion
          </p>
          <h2 className="mt-2 font-serif text-3xl text-[var(--color-ink)]">
            Conference and award moments.
          </h2>
        </div>

        <div className="space-y-4">
          <MarqueeRow items={conferences} title="Conferences" tone="soft" />
          <MarqueeRow items={awards} reverse title="Awards" tone="warm" />
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--color-wood)]">
              Testimonials
            </p>
            <h2 className="mt-2 font-serif text-3xl text-[var(--color-ink)]">
              Real patient voices that reinforce clinical trust.
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-[var(--color-mist)]">
            These review captures are placed as visual proof points rather than long text blocks,
            which keeps the mobile layout readable while still showing authentic feedback.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {testimonials.map((item) => (
            <GalleryCard key={item.src} item={item} tone="paper" />
          ))}
        </div>
      </section>
    </div>
  );
}
