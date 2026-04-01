import { apiFetch } from "./client";

export const getDoctorAccessSession = () =>
  apiFetch("/clinic/doctor-access/session/");

export const loginDoctorAccess = (credentials) =>
  apiFetch("/clinic/doctor-access/login/", {
    method: "POST",
    body: JSON.stringify(credentials),
  });

export const logoutDoctorAccess = () =>
  apiFetch("/clinic/doctor-access/logout/", {
    method: "POST",
  });

export const getDoctorAvailability = () =>
  apiFetch("/clinic/doctor-access/availability/");

export const getDoctorAppointments = () =>
  apiFetch("/clinic/doctor-access/appointments/");

export const createDoctorAvailability = (payload) =>
  apiFetch("/clinic/doctor-access/availability/", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const updateDoctorAvailability = (availabilityId, payload) =>
  apiFetch(`/clinic/doctor-access/availability/${availabilityId}/`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
