const BASE = "http://localhost:8000/api/appointments";

export const requestOTP = (phone_number) =>
  fetch(`${BASE}/otp/request/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone_number }),
  }).then(res => res.json());

export const bookAppointment = (payload) =>
  fetch(`${BASE}/book/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).then(res => res.json());
