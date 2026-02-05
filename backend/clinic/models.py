from django.conf import settings
from django.db import models

User = settings.AUTH_USER_MODEL

class DoctorProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    specialization = models.CharField(max_length=100)
    bio = models.TextField(blank=True)

    def __str__(self):
        return self.user.username
    

class AvailabilitySlot(models.Model):
    doctor = models.ForeignKey(DoctorProfile, on_delete=models.CASCADE)
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ('doctor', 'date', 'start_time')

    def __str__(self):
        return f"{self.date} {self.start_time}-{self.end_time}"
