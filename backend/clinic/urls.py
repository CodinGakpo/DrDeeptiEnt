from django.urls import path
from .doctor_access_views import (
    DoctorAccessAppointmentView,
    DoctorAccessAvailabilityDetailView,
    DoctorAccessAvailabilityView,
    DoctorAccessLoginView,
    DoctorAccessLogoutView,
    DoctorAccessSessionView,
)
from .views import DoctorListView, SlotListView

urlpatterns = [
    path("doctors/", DoctorListView.as_view(), name="doctor-list"),
    path("slots/", SlotListView.as_view(), name="slot-list"),
    path("doctor-access/session/", DoctorAccessSessionView.as_view(), name="doctor-access-session"),
    path("doctor-access/login/", DoctorAccessLoginView.as_view(), name="doctor-access-login"),
    path("doctor-access/logout/", DoctorAccessLogoutView.as_view(), name="doctor-access-logout"),
    path("doctor-access/appointments/", DoctorAccessAppointmentView.as_view(), name="doctor-access-appointments"),
    path("doctor-access/availability/", DoctorAccessAvailabilityView.as_view(), name="doctor-access-availability"),
    path(
        "doctor-access/availability/<int:availability_id>/",
        DoctorAccessAvailabilityDetailView.as_view(),
        name="doctor-access-availability-detail",
    ),
]
