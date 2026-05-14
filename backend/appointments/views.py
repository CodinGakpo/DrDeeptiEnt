import random
from django.conf import settings
from django.contrib.auth import get_user_model
from django.db import transaction
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from clinic.models import TimeSlot

from .models import Appointment, OTPVerification
from .otp_delivery import OTPDeliveryError, send_otp


User = get_user_model()


def normalize_phone_number(phone_number):
    return "".join(char for char in str(phone_number) if char.isdigit())


def get_doctor_name(doctor):
    full_name = doctor.user.get_full_name().strip()
    return full_name or doctor.user.username


class RequestOTPView(APIView):
    def post(self, request):
        phone = normalize_phone_number(request.data.get("phone_number"))

        if len(phone) < 10 or len(phone) > 15:
            return Response(
                {"error": "Enter a valid phone number"},
                status=status.HTTP_400_BAD_REQUEST
            )

        otp = str(random.randint(100000, 999999))

        OTPVerification.objects.create(
            phone_number=phone,
            otp=otp
        )

        try:
            delivery_channel = send_otp(phone, otp)
        except OTPDeliveryError as exc:
            return Response(
                {"error": "Unable to deliver verification code right now. Please try again."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        payload = {
            "message": "OTP sent successfully",
            "delivery_channel": delivery_channel,
        }
        if settings.DEBUG and str(settings.OTP_PROVIDER).strip().lower() == "console":
            payload["debug_otp"] = otp

        return Response(
            payload,
            status=status.HTTP_200_OK
        )


class BookAppointmentView(APIView):
    def post(self, request):
        phone = normalize_phone_number(request.data.get("phone_number"))
        otp = str(request.data.get("otp", "")).strip()
        slot_id = request.data.get("slot_id")
        name = str(request.data.get("name", "")).strip()
        age = request.data.get("age")
        sex = str(request.data.get("sex", "")).strip()

        if len(phone) < 10 or len(phone) > 15:
            return Response({"error": "Enter a valid phone number"}, status=400)
        if len(otp) != 6:
            return Response({"error": "Enter the 6-digit verification code"}, status=400)
        if not slot_id:
            return Response({"error": "Choose a time slot before confirming"}, status=400)
        if not name:
            return Response({"error": "Patient name is required"}, status=400)
        if not sex:
            return Response({"error": "Select a sex value"}, status=400)

        try:
            age = int(age)
        except (TypeError, ValueError):
            return Response({"error": "Enter a valid age"}, status=400)

        if age <= 0:
            return Response({"error": "Enter a valid age"}, status=400)

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
                    .select_related("availability", "availability__doctor", "availability__doctor__user")
                    .select_for_update()
                    .get(id=slot_id, is_booked=False)
                )

                appointment = Appointment.objects.create(
                    patient=user,
                    slot=slot,
                    name=name,
                    age=age,
                    sex=sex
                )

                slot.is_booked = True
                slot.save(update_fields=["is_booked"])

        except TimeSlot.DoesNotExist:
            return Response({"error": "Slot unavailable"}, status=400)

        return Response(
            {
                "message": "Appointment booked",
                "appointment": {
                    "id": appointment.id,
                    "name": appointment.name,
                    "age": appointment.age,
                    "sex": appointment.sex,
                    "phone_number": phone,
                    "date": slot.availability.date,
                    "start_time": slot.start_time,
                    "end_time": slot.end_time,
                    "doctor_name": get_doctor_name(slot.availability.doctor),
                    "specialization": slot.availability.doctor.specialization,
                },
            },
            status=201,
        )
