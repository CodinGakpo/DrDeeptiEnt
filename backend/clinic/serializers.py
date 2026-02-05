from rest_framework import serializers
from .models import DoctorProfile, AvailabilitySlot


class DoctorProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = DoctorProfile
        fields = ["id", "specialization", "bio"]


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
