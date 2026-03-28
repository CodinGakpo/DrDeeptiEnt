from django.contrib import admin
from django.db.models import Count, Q
from django.utils import timezone

from .models import AvailabilitySlot, DoctorProfile, TimeSlot


admin.site.site_header = "Beacon Clinic Console"
admin.site.site_title = "Beacon Clinic Admin"
admin.site.index_title = "Manage doctors, schedules, and appointments"


@admin.action(description="Mark selected availability as active")
def mark_availability_active(modeladmin, request, queryset):
    queryset.update(is_active=True)


@admin.action(description="Mark selected availability as inactive")
def mark_availability_inactive(modeladmin, request, queryset):
    queryset.update(is_active=False)


@admin.register(DoctorProfile)
class DoctorProfileAdmin(admin.ModelAdmin):
    list_display = (
        "display_name",
        "specialization",
        "bio_status",
        "next_available_date",
        "open_slot_count",
    )
    search_fields = (
        "user__username",
        "user__first_name",
        "user__last_name",
        "specialization",
        "bio",
    )
    autocomplete_fields = ("user",)
    list_select_related = ("user",)

    def display_name(self, obj):
        full_name = obj.user.get_full_name().strip()
        return full_name or obj.user.username

    display_name.short_description = "Doctor"

    def bio_status(self, obj):
        return "Complete" if obj.bio.strip() else "Needs bio"

    bio_status.short_description = "Profile copy"

    def next_available_date(self, obj):
        today = timezone.localdate()
        next_date = (
            AvailabilitySlot.objects.filter(
                doctor=obj,
                is_active=True,
                date__gte=today,
                time_slots__is_booked=False,
            )
            .order_by("date", "start_time")
            .values_list("date", flat=True)
            .distinct()
            .first()
        )
        return next_date or "No upcoming availability"

    next_available_date.short_description = "Next available"

    def open_slot_count(self, obj):
        today = timezone.localdate()
        return TimeSlot.objects.filter(
            availability__doctor=obj,
            availability__is_active=True,
            availability__date__gte=today,
            is_booked=False,
        ).count()

    open_slot_count.short_description = "Open slots"


@admin.register(AvailabilitySlot)
class AvailabilitySlotAdmin(admin.ModelAdmin):
    list_display = (
        "doctor_name",
        "date",
        "start_time",
        "end_time",
        "generated_slots",
        "booked_slots",
        "is_active",
    )
    list_filter = ("is_active", "date", "doctor__specialization")
    search_fields = (
        "doctor__user__username",
        "doctor__user__first_name",
        "doctor__user__last_name",
        "doctor__specialization",
    )
    autocomplete_fields = ("doctor",)
    date_hierarchy = "date"
    ordering = ("-date", "start_time")
    list_editable = ("is_active",)
    save_on_top = True
    actions = (mark_availability_active, mark_availability_inactive)

    def get_queryset(self, request):
        return (
            super()
            .get_queryset(request)
            .select_related("doctor", "doctor__user")
            .annotate(
                generated_slots_count=Count("time_slots", distinct=True),
                booked_slots_count=Count(
                    "time_slots",
                    filter=Q(time_slots__is_booked=True),
                    distinct=True,
                ),
            )
        )

    def doctor_name(self, obj):
        full_name = obj.doctor.user.get_full_name().strip()
        return full_name or obj.doctor.user.username

    doctor_name.short_description = "Doctor"

    def generated_slots(self, obj):
        return obj.generated_slots_count

    generated_slots.short_description = "Generated slots"

    def booked_slots(self, obj):
        return obj.booked_slots_count

    booked_slots.short_description = "Booked"


@admin.register(TimeSlot)
class TimeSlotAdmin(admin.ModelAdmin):
    list_display = (
        "doctor_name",
        "date",
        "start_time",
        "end_time",
        "is_booked",
    )
    list_filter = ("is_booked", "availability__date", "availability__doctor__specialization")
    search_fields = (
        "availability__doctor__user__username",
        "availability__doctor__user__first_name",
        "availability__doctor__user__last_name",
        "availability__doctor__specialization",
    )
    readonly_fields = ("availability", "start_time", "end_time", "is_booked")
    list_select_related = ("availability", "availability__doctor", "availability__doctor__user")
    ordering = ("-availability__date", "start_time")

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False

    def doctor_name(self, obj):
        full_name = obj.availability.doctor.user.get_full_name().strip()
        return full_name or obj.availability.doctor.user.username

    doctor_name.short_description = "Doctor"

    def date(self, obj):
        return obj.availability.date

    date.short_description = "Date"
