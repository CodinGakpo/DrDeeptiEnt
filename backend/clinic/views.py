from rest_framework.generics import ListAPIView
from .models import DoctorProfile, AvailabilitySlot
from .serializers import DoctorProfileSerializer, AvailabilitySlotSerializer


class DoctorListView(ListAPIView):
    """
    Public:
    - View doctor info
    """
    queryset = DoctorProfile.objects.all()
    serializer_class = DoctorProfileSerializer


class SlotListView(ListAPIView):
    """
    Public:
    - View available slots
    - No booking here
    """
    serializer_class = AvailabilitySlotSerializer

    def get_queryset(self):
        queryset = AvailabilitySlot.objects.filter(is_active=True)

        doctor_id = self.request.query_params.get("doctor")
        date = self.request.query_params.get("date")

        if doctor_id:
            queryset = queryset.filter(doctor_id=doctor_id)

        if date:
            queryset = queryset.filter(date=date)

        return queryset.order_by("date", "start_time")
