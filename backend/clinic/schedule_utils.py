from datetime import time, timedelta

from django.utils import timezone

from .models import AvailabilitySlot

DEFAULT_SCHEDULE_START = time(hour=12, minute=0)
DEFAULT_SCHEDULE_END = time(hour=15, minute=0)
DEFAULT_SCHEDULE_DAYS_AHEAD = 14
DEFAULT_ACTIVE_WEEKDAYS = {0, 1, 2, 3, 4, 5}


def ensure_future_availability_for_doctor(
    doctor,
    days_ahead=DEFAULT_SCHEDULE_DAYS_AHEAD,
):
    if doctor is None or days_ahead <= 0:
        return []

    today = timezone.localdate()
    created_slots = []

    for offset in range(days_ahead + 1):
        target_date = today + timedelta(days=offset)

        if target_date.weekday() not in DEFAULT_ACTIVE_WEEKDAYS:
            continue

        if AvailabilitySlot.objects.filter(doctor=doctor, date=target_date).exists():
            continue

        availability = AvailabilitySlot.objects.create(
            doctor=doctor,
            date=target_date,
            start_time=DEFAULT_SCHEDULE_START,
            end_time=DEFAULT_SCHEDULE_END,
            is_active=True,
        )
        created_slots.append(availability)

    return created_slots
