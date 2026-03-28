import { apiFetch } from "./client";

export const getDoctors = () =>
  apiFetch("/clinic/doctors/");

export const getSlots = (doctorId, date) =>
  apiFetch(`/clinic/slots/?doctor=${doctorId}&date=${date}`);

export const requestOTP = (phone) =>
  apiFetch("/appointments/otp/request/", {
    method: "POST",
    body: JSON.stringify({ phone_number: phone }),
  });

export const bookAppointment = (data) =>
  apiFetch("/appointments/book/", {
    method: "POST",
    body: JSON.stringify(data),
  });
