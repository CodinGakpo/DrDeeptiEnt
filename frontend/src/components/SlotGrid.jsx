import { getDayPart, formatTimeRange } from "../utils/formatters";

export default function SlotGrid({ onSelect, selectedSlotId, slots }) {
  const groups = slots.reduce((accumulator, slot) => {
    const dayPart = getDayPart(slot.start_time);

    if (!accumulator[dayPart]) {
      accumulator[dayPart] = [];
    }

    accumulator[dayPart].push(slot);
    return accumulator;
  }, {});

  const orderedGroups = ["Morning", "Afternoon", "Evening"].filter(
    (groupName) => groups[groupName]?.length,
  );

  return (
    <div className="space-y-6">
      {orderedGroups.map((groupName) => (
        <section key={groupName}>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--color-wood)]">
              {groupName}
            </h3>
            <span className="text-xs text-[var(--color-mist)]">
              {groups[groupName].length} slots
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {groups[groupName].map((slot) => {
              const isBooked = slot.is_booked === true;
              const isSelected = selectedSlotId === slot.id;

              return (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => !isBooked && onSelect(slot.id)}
                  disabled={isBooked}
                  className={`rounded-[22px] border px-4 py-4 text-left transition duration-200 ${isBooked ? "cursor-not-allowed border-[var(--color-line)] bg-[rgba(97,115,111,0.06)] text-[var(--color-mist)]" : isSelected ? "border-[rgba(45,124,119,0.36)] bg-[var(--color-cyan-soft)] text-[var(--color-ink)] shadow-[0_14px_28px_rgba(45,124,119,0.08)]" : "border-[var(--color-line)] bg-[var(--color-paper)] text-[var(--color-ink)] hover:-translate-y-0.5 hover:border-[rgba(138,102,72,0.24)] hover:bg-[var(--color-paper-soft)]"}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-base font-semibold">
                        {formatTimeRange(slot.start_time, slot.end_time)}
                      </p>
                      <p className="mt-1 text-xs uppercase tracking-[0.24em] text-[var(--color-mist)]">
                        {isBooked ? "Unavailable" : isSelected ? "Selected" : "Available"}
                      </p>
                    </div>

                    <span className="rounded-full border border-[var(--color-line)] px-2 py-1 text-[11px] uppercase tracking-[0.2em] text-[var(--color-wood)]">
                      15 min
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
