from django.shortcuts import render
import random
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import OTPVerification
from django.db import transaction
from django.db.models import Q
from clinic.models import TimeSlot

class RequestOTPView(APIView):
    """
    Step 1 of booking:
    - Takes phone number
    - Generates OTP
    - Stores OTP (mocked)
    """

    def post(self, request):
        phone = request.data.get("phone_number")

        if not phone:
            return Response(
                {"error": "Phone number required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        otp = str(random.randint(100000, 999999))

        OTPVerification.objects.create(
            phone_number=phone,
            otp=otp
        )

        # DEV ONLY (Phase 1)
        print("DEV OTP:", otp)

        return Response(
            {"message": "OTP sent successfully"},
            status=status.HTTP_200_OK
        )

from clinic.models import AvailabilitySlot
from .models import Appointment, OTPVerification
from django.contrib.auth import get_user_model

User = get_user_model()



from django.db import transaction
from clinic.models import TimeSlot
from .models import Appointment, OTPVerification
from django.contrib.auth import get_user_model
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

User = get_user_model()


class BookAppointmentView(APIView):

    def post(self, request):
        phone = request.data.get("phone_number")
        otp = request.data.get("otp")
        slot_id = request.data.get("slot_id")
        name = request.data.get("name")
        age = request.data.get("age")
        sex = request.data.get("sex")

        # 1. Verify OTP
        try:
            otp_obj = OTPVerification.objects.filter(
                phone_number=phone,
                otp=otp,
                is_verified=False
            ).latest("created_at")
        except OTPVerification.DoesNotExist:
            return Response({"error": "Invalid OTP"}, status=400)

        otp_obj.is_verified = True
        otp_obj.save()

        # 2. Get or create patient
        user, _ = User.objects.get_or_create(
            phone_number=phone,
            defaults={"username": phone}
        )

        # 3. Atomic booking of TimeSlot
        try:
            with transaction.atomic():
                slot = (
                    TimeSlot.objects
                    .select_for_update()
                    .get(id=slot_id, is_booked=False)
                )

                Appointment.objects.create(
                    patient=user,
                    slot=slot,
                    name=name,
                    age=age,
                    sex=sex
                )

                slot.is_booked = True
                slot.save()

        except TimeSlot.DoesNotExist:
            return Response({"error": "Slot unavailable"}, status=400)

        return Response({"message": "Appointment booked"}, status=201)
