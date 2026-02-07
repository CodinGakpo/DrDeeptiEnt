from django.contrib import admin
from .models import AvailabilitySlot, TimeSlot, DoctorProfile
admin.site.register(DoctorProfile)
admin.site.register(AvailabilitySlot)
admin.site.register(TimeSlot)
