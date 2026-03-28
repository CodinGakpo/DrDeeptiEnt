from datetime import datetime, timedelta

from django.conf import settings
from django.db import connection, models


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

    def save(self, *args, **kwargs):
        previous_values = None

        if self.pk:
            previous_values = (
                AvailabilitySlot.objects.filter(pk=self.pk)
                .values("date", "start_time", "end_time")
                .first()
            )

        super().save(*args, **kwargs)

        schedule_changed = (
            previous_values is None
            or previous_values["date"] != self.date
            or previous_values["start_time"] != self.start_time
            or previous_values["end_time"] != self.end_time
        )

        if schedule_changed and "clinic_timeslot" in connection.introspection.table_names():
            self.generate_time_slots()

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
