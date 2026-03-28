from rest_framework.generics import ListAPIView

from .models import DoctorProfile, TimeSlot
from .serializers import DoctorProfileSerializer, TimeSlotSerializer

class DoctorListView(ListAPIView):
    """
    Public:
    - View doctor info
    """
    queryset = DoctorProfile.objects.select_related("user").all()
    serializer_class = DoctorProfileSerializer

class SlotListView(ListAPIView):
    serializer_class = TimeSlotSerializer

    def get_queryset(self):
        qs = TimeSlot.objects.select_related(
            "availability",
            "availability__doctor",
            "availability__doctor__user",
        ).filter(availability__is_active=True)

        doctor_id = self.request.query_params.get("doctor")
        date = self.request.query_params.get("date")

        if doctor_id:
            qs = qs.filter(availability__doctor_id=doctor_id)

        if date:
            qs = qs.filter(availability__date=date)

        return qs.order_by("start_time")
