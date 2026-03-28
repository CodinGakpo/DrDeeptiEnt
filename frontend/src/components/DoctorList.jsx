import { Link } from "react-router-dom";

import Button from "./Button";
import { formatShortDate } from "../utils/formatters";
import { getDoctorProfileContent } from "../utils/doctorProfiles";

export default function DoctorList({ doctors, onSelect, selectedDoctorId }) {
  if (!doctors.length) {
    return (
      <div className="rounded-[28px] border border-dashed border-[var(--color-line)] bg-[var(--color-paper)] p-6 text-sm text-[var(--color-mist)]">
        Doctor profiles will appear here once the clinic schedule is available.
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {doctors.map((doctor) => {
        const profile = getDoctorProfileContent(doctor);
        const isSelected = selectedDoctorId === doctor.id;

        return (
          <article
            key={doctor.id}
            className={`rounded-[28px] border p-5 text-left transition duration-300 ${isSelected ? "border-[rgba(45,124,119,0.28)] bg-[linear-gradient(145deg,#eef7f5,#ffffff)] shadow-[0_18px_42px_rgba(45,124,119,0.08)]" : "border-[var(--color-line)] bg-[var(--color-paper)] hover:-translate-y-0.5 hover:border-[rgba(138,102,72,0.24)] hover:bg-[var(--color-paper-soft)]"}`}
          >
            <div className="flex gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] bg-[linear-gradient(135deg,var(--color-cyan),var(--color-cyan-deep))] text-lg font-semibold text-white shadow-[0_14px_30px_rgba(45,124,119,0.16)]">
                {profile.initials}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--color-wood)]">
                      Consultant profile
                    </p>
                    <h3 className="mt-1 text-xl font-semibold text-[var(--color-ink)]">
                      {profile.name}
                    </h3>
                    <p className="mt-1 text-sm text-[var(--color-cyan-deep)]">
                      {profile.credentials}
                    </p>
                    <p className="mt-1 text-sm text-[var(--color-mist)]">
                      {profile.professionalTitle} at {profile.currentPracticeShort}
                    </p>
                  </div>

                  <div className="inline-flex rounded-full border border-[var(--color-line)] bg-[var(--color-paper-soft)] px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-[var(--color-wood)]">
                    Next {formatShortDate(profile.next_available_date)}
                  </div>
                </div>

                <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--color-mist)]">
                  {profile.summary}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {profile.focusAreas.slice(0, 3).map((item) => (
                    <span
                      key={`${doctor.id}-${item}`}
                      className="rounded-full border border-[var(--color-line)] bg-[var(--color-cyan-soft)] px-3 py-1 text-xs text-[var(--color-cyan-deep)]"
                    >
                      {item}
                    </span>
                  ))}
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <Button
                    size="sm"
                    variant={isSelected ? "secondary" : "primary"}
                    onClick={() => onSelect(doctor.id)}
                  >
                    {isSelected ? "Selected" : "Choose doctor"}
                  </Button>

                  <Link
                    className="text-sm font-medium text-[var(--color-wood-deep)] transition hover:text-[var(--color-cyan-deep)]"
                    to={`/doctors/${doctor.id}`}
                  >
                    View full profile
                  </Link>

                  <span className="text-sm text-[var(--color-mist)]">
                    {profile.open_slot_count} open future slots
                  </span>
                </div>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
