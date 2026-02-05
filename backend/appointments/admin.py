from django.contrib import admin
from .models import Appointment, OTPVerification

admin.site.register(Appointment)
admin.site.register(OTPVerification)
