from django.contrib import admin
from .models import Appointment

@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = (
        "name",          # Patient name (human)
        "patient_phone",
        "slot_time",
        "created_at",
    )

    readonly_fields = ("patient", "slot", "created_at")

    def patient_phone(self, obj):
        return obj.patient.phone_number
    patient_phone.short_description = "Patient Phone"

    def slot_time(self, obj):
        return f"{obj.slot.start_time} - {obj.slot.end_time}"
    slot_time.short_description = "Time Slot"
