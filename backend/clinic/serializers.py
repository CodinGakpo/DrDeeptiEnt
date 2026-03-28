from django.utils import timezone
from rest_framework import serializers

from .models import AvailabilitySlot, DoctorProfile, TimeSlot


class DoctorProfileSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    initials = serializers.SerializerMethodField()
    next_available_date = serializers.SerializerMethodField()
    open_slot_count = serializers.SerializerMethodField()

    class Meta:
        model = DoctorProfile
        fields = [
            "id",
            "name",
            "initials",
            "specialization",
            "bio",
            "next_available_date",
            "open_slot_count",
        ]

    def get_name(self, obj):
        full_name = obj.user.get_full_name().strip()
        return full_name or obj.user.username

    def get_initials(self, obj):
        words = self.get_name(obj).split()
        initials = "".join(word[0] for word in words[:2]).upper()
        return initials or "DR"

    def get_next_available_date(self, obj):
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
        return next_date

    def get_open_slot_count(self, obj):
        today = timezone.localdate()
        return TimeSlot.objects.filter(
            availability__doctor=obj,
            availability__is_active=True,
            availability__date__gte=today,
            is_booked=False,
        ).count()


class AvailabilitySlotSerializer(serializers.ModelSerializer):
    doctor = serializers.StringRelatedField()

    class Meta:
        model = AvailabilitySlot
        fields = [
            "id",
            "doctor",
            "date",
            "start_time",
            "end_time",
        ]


class TimeSlotSerializer(serializers.ModelSerializer):
    date = serializers.DateField(source="availability.date", read_only=True)

    class Meta:
        model = TimeSlot
        fields = ["id", "date", "start_time", "end_time", "is_booked"]


class DoctorAccessAvailabilitySerializer(serializers.ModelSerializer):
    slot_count = serializers.SerializerMethodField()
    booked_slot_count = serializers.SerializerMethodField()

    class Meta:
        model = AvailabilitySlot
        fields = [
            "id",
            "date",
            "start_time",
            "end_time",
            "is_active",
            "slot_count",
            "booked_slot_count",
        ]

    def get_slot_count(self, obj):
        return obj.time_slots.count()

    def get_booked_slot_count(self, obj):
        return obj.time_slots.filter(is_booked=True).count()


class DoctorAccessAvailabilityCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = AvailabilitySlot
        fields = ["date", "start_time", "end_time", "is_active"]

    def validate(self, attrs):
        if attrs["end_time"] <= attrs["start_time"]:
            raise serializers.ValidationError(
                {"end_time": "End time must be later than start time."}
            )

        if attrs["date"] < timezone.localdate():
            raise serializers.ValidationError(
                {"date": "Choose today or a future date."}
            )

        return attrs


class DoctorAccessAvailabilityStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = AvailabilitySlot
        fields = ["is_active"]
