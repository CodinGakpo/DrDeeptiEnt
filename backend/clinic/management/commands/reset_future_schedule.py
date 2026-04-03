from datetime import timedelta

from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from clinic.models import AvailabilitySlot, DoctorProfile
from clinic.schedule_utils import DEFAULT_SCHEDULE_DAYS_AHEAD, ensure_future_availability_for_doctor


class Command(BaseCommand):
    help = (
        "One-time cleanup for future clinic availability. "
        "Removes unbooked future availability in the target window and rebuilds the "
        "default Monday-Saturday 12 PM - 3 PM schedule. Dates with booked appointments are preserved."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--doctor-id",
            type=int,
            help="Optional doctor profile id. When omitted, runs for all doctors.",
        )
        parser.add_argument(
            "--days-ahead",
            type=int,
            default=DEFAULT_SCHEDULE_DAYS_AHEAD,
            help="How many days ahead to rebuild, inclusive of today. Default: 14.",
        )
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Preview the cleanup without deleting or creating anything.",
        )

    def handle(self, *args, **options):
        doctor_id = options["doctor_id"]
        days_ahead = options["days_ahead"]
        dry_run = options["dry_run"]

        if days_ahead < 0:
            self.stderr.write(self.style.ERROR("--days-ahead must be zero or greater."))
            return

        doctors = DoctorProfile.objects.select_related("user").order_by("id")
        if doctor_id:
            doctors = doctors.filter(id=doctor_id)

        doctors = list(doctors)
        if not doctors:
            self.stderr.write(self.style.ERROR("No matching doctor profiles found."))
            return

        today = timezone.localdate()
        end_date = today + timedelta(days=days_ahead)

        mode_label = "DRY RUN" if dry_run else "LIVE RUN"
        self.stdout.write(
            self.style.WARNING(
                f"{mode_label}: rebuilding future schedule from {today} through {end_date}."
            )
        )

        for doctor in doctors:
            doctor_name = doctor.user.get_full_name().strip() or doctor.user.username

            future_availability = AvailabilitySlot.objects.filter(
                doctor=doctor,
                date__gte=today,
                date__lte=end_date,
            )

            booked_dates = set(
                future_availability.filter(time_slots__is_booked=True)
                .values_list("date", flat=True)
                .distinct()
            )

            removable_availability = future_availability.exclude(date__in=booked_dates)
            removable_count = removable_availability.count()
            removable_dates = list(
                removable_availability.order_by("date").values_list("date", flat=True).distinct()
            )

            self.stdout.write("")
            self.stdout.write(self.style.WARNING(f"Doctor: {doctor_name} (id={doctor.id})"))
            self.stdout.write(
                f"Booked dates preserved: {len(booked_dates)}"
                + (
                    f" -> {', '.join(str(value) for value in sorted(booked_dates))}"
                    if booked_dates
                    else ""
                )
            )
            self.stdout.write(
                f"Availability rows to remove: {removable_count}"
                + (
                    f" across {len(removable_dates)} date(s)"
                    if removable_dates
                    else ""
                )
            )

            if dry_run:
                simulated_created_dates = self._get_missing_default_dates(
                    doctor=doctor,
                    start_date=today,
                    end_date=end_date,
                    preserved_dates=booked_dates,
                    removed_dates=set(removable_dates),
                )
                self.stdout.write(
                    f"Default schedule dates that would be present after rebuild: "
                    f"{len(simulated_created_dates) + len(booked_dates)}"
                )
                continue

            with transaction.atomic():
                removable_availability.delete()
                created_slots = ensure_future_availability_for_doctor(
                    doctor,
                    days_ahead=days_ahead,
                )

            created_dates = sorted({slot.date for slot in created_slots})
            self.stdout.write(
                self.style.SUCCESS(
                    f"Removed {removable_count} availability row(s); created {len(created_slots)} "
                    f"default availability row(s) across {len(created_dates)} date(s)."
                )
            )

        self.stdout.write("")
        self.stdout.write(self.style.SUCCESS("Future schedule cleanup completed."))

    def _get_missing_default_dates(self, doctor, start_date, end_date, preserved_dates, removed_dates):
        existing_dates = set(
            AvailabilitySlot.objects.filter(
                doctor=doctor,
                date__gte=start_date,
                date__lte=end_date,
            )
            .values_list("date", flat=True)
            .distinct()
        )
        effective_existing_dates = (existing_dates - removed_dates) | preserved_dates

        schedule_dates = []
        current_date = start_date
        while current_date <= end_date:
            if current_date.weekday() <= 5 and current_date not in effective_existing_dates:
                schedule_dates.append(current_date)
            current_date += timedelta(days=1)

        return schedule_dates
