from django.urls import path
from .views import DoctorListView, SlotListView

urlpatterns = [
    path("doctors/", DoctorListView.as_view(), name="doctor-list"),
    path("slots/", SlotListView.as_view(), name="slot-list"),
]
