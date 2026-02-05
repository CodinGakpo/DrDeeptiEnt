from django.urls import path
from .views import RequestOTPView, BookAppointmentView

urlpatterns = [
    path("otp/request/", RequestOTPView.as_view(), name="request-otp"),
     path("book/", BookAppointmentView.as_view()),
]
