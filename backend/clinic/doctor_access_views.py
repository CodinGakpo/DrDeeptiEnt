import secrets

from django.conf import settings
from django.db.models import Prefetch
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import AvailabilitySlot, DoctorProfile, TimeSlot
from .serializers import (
    DoctorAccessAvailabilityCreateSerializer,
    DoctorAccessAvailabilitySerializer,
    DoctorAccessAvailabilityStatusSerializer,
    DoctorProfileSerializer,
)


DOCTOR_ACCESS_SESSION_KEY = "doctor_access_authenticated"


def get_managed_doctor():
    return DoctorProfile.objects.select_related("user").order_by("id").first()


def get_authenticated_doctor(request):
    if not request.session.get(DOCTOR_ACCESS_SESSION_KEY):
        return None

    return get_managed_doctor()


class DoctorAccessSessionView(APIView):
    authentication_classes = []
    permission_classes = []

    def get(self, request):
        doctor = get_authenticated_doctor(request)

        return Response(
            {
                "authenticated": doctor is not None,
                "doctor": DoctorProfileSerializer(doctor).data if doctor else None,
            }
        )


class DoctorAccessLoginView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        configured_username = settings.DOCTOR_ACCESS_USERNAME
        configured_password = settings.DOCTOR_ACCESS_PASSWORD

        if not configured_username or not configured_password:
            return Response(
                {"error": "Doctor access credentials are not configured."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        username = str(request.data.get("username", "")).strip()
        password = str(request.data.get("password", ""))

        if not (
            secrets.compare_digest(username, configured_username)
            and secrets.compare_digest(password, configured_password)
        ):
            return Response(
                {"error": "Invalid access credentials."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        doctor = get_managed_doctor()

        if doctor is None:
            return Response(
                {"error": "No doctor profile is available for schedule management."},
                status=status.HTTP_404_NOT_FOUND,
            )

        request.session.cycle_key()
        request.session[DOCTOR_ACCESS_SESSION_KEY] = True

        return Response(
            {
                "message": "Doctor access granted.",
                "doctor": DoctorProfileSerializer(doctor).data,
            }
        )


class DoctorAccessLogoutView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        request.session.pop(DOCTOR_ACCESS_SESSION_KEY, None)
        request.session.cycle_key()
        return Response({"message": "Doctor access cleared."})


class DoctorAccessAvailabilityView(APIView):
    authentication_classes = []
    permission_classes = []

    def get(self, request):
        doctor = get_authenticated_doctor(request)

        if doctor is None:
            return Response(
                {"error": "Authentication required."},
                status=status.HTTP_403_FORBIDDEN,
            )

        queryset = (
            AvailabilitySlot.objects.filter(doctor=doctor)
            .prefetch_related(
                Prefetch("time_slots", queryset=TimeSlot.objects.order_by("start_time"))
            )
            .order_by("date", "start_time")
        )

        return Response(
            {
                "doctor": DoctorProfileSerializer(doctor).data,
                "availability": DoctorAccessAvailabilitySerializer(queryset, many=True).data,
            }
        )

    def post(self, request):
        doctor = get_authenticated_doctor(request)

        if doctor is None:
            return Response(
                {"error": "Authentication required."},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = DoctorAccessAvailabilityCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        availability = serializer.save(doctor=doctor)

        return Response(
            {
                "message": "Availability created successfully.",
                "availability": DoctorAccessAvailabilitySerializer(availability).data,
            },
            status=status.HTTP_201_CREATED,
        )


class DoctorAccessAvailabilityDetailView(APIView):
    authentication_classes = []
    permission_classes = []

    def patch(self, request, availability_id):
        doctor = get_authenticated_doctor(request)

        if doctor is None:
            return Response(
                {"error": "Authentication required."},
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            availability = AvailabilitySlot.objects.get(id=availability_id, doctor=doctor)
        except AvailabilitySlot.DoesNotExist:
            return Response(
                {"error": "Availability slot not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = DoctorAccessAvailabilityStatusSerializer(
            availability,
            data=request.data,
            partial=True,
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(
            {
                "message": "Availability updated successfully.",
                "availability": DoctorAccessAvailabilitySerializer(availability).data,
            }
        )
