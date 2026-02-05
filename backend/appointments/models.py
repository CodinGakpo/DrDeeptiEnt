from django.conf import settings
from django.db import models
from clinic.models import AvailabilitySlot

User = settings.AUTH_USER_MODEL

class Appointment(models.Model):
    patient = models.ForeignKey(User, on_delete=models.CASCADE)
    slot = models.OneToOneField(AvailabilitySlot, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    age = models.PositiveIntegerField()
    sex = models.CharField(max_length=10)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.slot}"

class OTPVerification(models.Model):
    phone_number = models.CharField(max_length=15)
    otp = models.CharField(max_length=6)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
