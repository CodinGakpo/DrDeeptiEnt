from django.contrib import admin

from .models import Appointment


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "patient_phone",
        "doctor_name",
        "appointment_date",
        "slot_time",
        "created_at",
    )
    list_filter = ("created_at", "slot__availability__doctor__specialization")
    search_fields = (
        "name",
        "patient__phone_number",
        "slot__availability__doctor__user__username",
        "slot__availability__doctor__user__first_name",
        "slot__availability__doctor__user__last_name",
    )
    ordering = ("-created_at",)
    readonly_fields = (
        "patient",
        "slot",
        "created_at",
        "patient_phone",
        "doctor_name",
        "appointment_date",
        "slot_time",
    )
    list_select_related = (
        "patient",
        "slot",
        "slot__availability",
        "slot__availability__doctor",
        "slot__availability__doctor__user",
    )

    def patient_phone(self, obj):
        return obj.patient.phone_number

    patient_phone.short_description = "Patient Phone"

    def doctor_name(self, obj):
        full_name = obj.slot.availability.doctor.user.get_full_name().strip()
        return full_name or obj.slot.availability.doctor.user.username

    doctor_name.short_description = "Doctor"

    def appointment_date(self, obj):
        return obj.slot.availability.date

    appointment_date.short_description = "Date"

    def slot_time(self, obj):
        return f"{obj.slot.start_time} - {obj.slot.end_time}"

    slot_time.short_description = "Time Slot"
