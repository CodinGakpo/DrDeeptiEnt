from rest_framework.generics import ListAPIView

from .models import DoctorProfile, TimeSlot
from .schedule_utils import ensure_future_availability_for_doctor
from .serializers import DoctorProfileSerializer, TimeSlotSerializer

class DoctorListView(ListAPIView):
    """
    Public:
    - View doctor info
    """
    queryset = DoctorProfile.objects.select_related("user").all()
    serializer_class = DoctorProfileSerializer

    def get_queryset(self):
        queryset = DoctorProfile.objects.select_related("user").all()

        for doctor in queryset:
            ensure_future_availability_for_doctor(doctor)

        return queryset

class SlotListView(ListAPIView):
    serializer_class = TimeSlotSerializer

    def get_queryset(self):
        doctor_id = self.request.query_params.get("doctor")
        date = self.request.query_params.get("date")

        doctors = DoctorProfile.objects.all()
        if doctor_id:
            doctors = doctors.filter(id=doctor_id)

        for doctor in doctors:
            ensure_future_availability_for_doctor(doctor)

        qs = TimeSlot.objects.select_related(
            "availability",
            "availability__doctor",
            "availability__doctor__user",
        ).filter(availability__is_active=True)

        if doctor_id:
            qs = qs.filter(availability__doctor_id=doctor_id)

        if date:
            qs = qs.filter(availability__date=date)

        return qs.order_by("start_time")
