const longDateFormatter = new Intl.DateTimeFormat("en-IN", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

const shortDateFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
});

const timeFormatter = new Intl.DateTimeFormat("en-IN", {
  hour: "numeric",
  minute: "2-digit",
});

export function formatDateLabel(dateValue) {
  if (!dateValue) {
    return "Not selected";
  }

  return longDateFormatter.format(new Date(`${dateValue}T00:00:00`));
}

export function formatShortDate(dateValue) {
  if (!dateValue) {
    return "Schedule coming soon";
  }

  return shortDateFormatter.format(new Date(`${dateValue}T00:00:00`));
}

export function formatTimeLabel(timeValue) {
  if (!timeValue) {
    return "--";
  }

  return timeFormatter.format(new Date(`1970-01-01T${timeValue}`));
}

export function formatTimeRange(startTime, endTime) {
  return `${formatTimeLabel(startTime)} - ${formatTimeLabel(endTime)}`;
}

export function getDayPart(timeValue) {
  const [hourText = "0"] = String(timeValue).split(":");
  const hour = Number(hourText);

  if (hour < 12) {
    return "Morning";
  }

  if (hour < 17) {
    return "Afternoon";
  }

  return "Evening";
}
