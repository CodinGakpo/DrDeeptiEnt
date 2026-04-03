from datetime import timedelta

from django.utils import timezone

from .models import AvailabilitySlot


def _get_template_date(doctor, template_date=None):
    if doctor is None:
        return None

    if template_date and AvailabilitySlot.objects.filter(
        doctor=doctor,
        date=template_date,
    ).exists():
        return template_date

    today = timezone.localdate()

    latest_future_active = (
        AvailabilitySlot.objects.filter(
            doctor=doctor,
            is_active=True,
            date__gte=today,
        )
        .order_by("-date")
        .values_list("date", flat=True)
        .first()
    )
    if latest_future_active:
        return latest_future_active

    latest_active = (
        AvailabilitySlot.objects.filter(doctor=doctor, is_active=True)
        .order_by("-date")
        .values_list("date", flat=True)
        .first()
    )
    if latest_active:
        return latest_active

    return (
        AvailabilitySlot.objects.filter(doctor=doctor)
        .order_by("-date")
        .values_list("date", flat=True)
        .first()
    )


def ensure_future_availability_for_doctor(doctor, days_ahead=5, template_date=None):
    if doctor is None or days_ahead <= 0:
        return []

    source_date = _get_template_date(doctor, template_date=template_date)
    if source_date is None:
        return []

    template_slots = list(
        AvailabilitySlot.objects.filter(doctor=doctor, date=source_date).order_by("start_time")
    )
    if not template_slots:
        return []

    today = timezone.localdate()
    if template_date:
        target_dates = [template_date + timedelta(days=offset) for offset in range(1, days_ahead + 1)]
    else:
        target_dates = [today + timedelta(days=offset) for offset in range(1, days_ahead + 1)]

    created_slots = []

    for target_date in target_dates:
        if (
            not template_date
            and AvailabilitySlot.objects.filter(doctor=doctor, date=target_date).exists()
        ):
            continue

        for template_slot in template_slots:
            availability, was_created = AvailabilitySlot.objects.get_or_create(
                doctor=doctor,
                date=target_date,
                start_time=template_slot.start_time,
                defaults={
                    "end_time": template_slot.end_time,
                    "is_active": template_slot.is_active,
                },
            )
            if was_created:
                created_slots.append(availability)

    return created_slots
