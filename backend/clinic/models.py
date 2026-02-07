from django.conf import settings
from django.db import models
from datetime import timedelta, datetime


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
    def generate_time_slots(self, interval_minutes=15):
        self.time_slots.all().delete()

        start_dt = datetime.combine(self.date, self.start_time)
        end_dt = datetime.combine(self.date, self.end_time)

        current = start_dt
        while current + timedelta(minutes=interval_minutes) <= end_dt:
            TimeSlot.objects.create(
                availability=self,
                start_time=current.time(),
                end_time=(current + timedelta(minutes=interval_minutes)).time()
            )
            current += timedelta(minutes=interval_minutes)


class TimeSlot(models.Model):
    availability = models.ForeignKey(
        AvailabilitySlot,
        on_delete=models.CASCADE,
        related_name="time_slots"
    )
    start_time = models.TimeField()
    end_time = models.TimeField()
    is_booked = models.BooleanField(default=False)

    class Meta:
        unique_together = ("availability", "start_time")

    def __str__(self):
        return f"{self.availability.date} {self.start_time}-{self.end_time}"


from django.db.models.signals import post_save
from django.dispatch import receiver

from django.db import connection

@receiver(post_save, sender=AvailabilitySlot)
def create_time_slots(sender, instance, created, **kwargs):
    # Prevent execution before TimeSlot table exists
    if "clinic_timeslot" not in connection.introspection.table_names():
        return

    instance.generate_time_slots()
