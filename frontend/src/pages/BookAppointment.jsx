import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import Button from "../components/Button";
import DoctorList from "../components/DoctorList";
import SlotGrid from "../components/SlotGrid";
import { useBooking } from "../hooks/useBooking";
import { getApiErrorMessage } from "../utils/api";
import { formatDateLabel, formatTimeRange } from "../utils/formatters";
import { getDoctorProfileContent } from "../utils/doctorProfiles";

const bookingSteps = [
  {
    step: 1,
    title: "Choose doctor",
    description: "Review the consultant profile before moving into the schedule.",
  },
  {
    step: 2,
    title: "Choose day",
    description: "Pick the visit date before loading the published timings.",
  },
  {
    step: 3,
    title: "Choose slot",
    description: "Select the best available appointment time for the visit.",
  },
  {
    step: 4,
    title: "Patient details",
    description: "Add the patient information needed to complete the booking.",
  },
  {
    step: 5,
    title: "Verify and confirm",
    description: "Confirm the phone number with OTP and finish the booking.",
  },
  {
    step: 6,
    title: "Done",
    description: "Review the confirmed appointment summary.",
  },
];

const initialPatientForm = {
  name: "",
  age: "",
  sex: "Female",
  phone: "",
};

const initialOtpState = {
  requested: false,
  loading: false,
  message: "",
  debugOtp: "",
  phone: "",
};

const fieldClassName =
  "w-full rounded-[18px] border border-[var(--color-line)] bg-[var(--color-paper)] px-4 py-3 text-sm text-[var(--color-ink)] outline-none transition placeholder:text-[var(--color-mist)] focus:border-[rgba(45,124,119,0.32)] focus:bg-[var(--color-paper-soft)]";

function SummaryRow({ label, value }) {
  return (
    <div className="flex flex-col gap-1 border-b border-[var(--color-line)] py-3 last:border-b-0 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
      <dt className="text-sm text-[var(--color-mist)]">{label}</dt>
      <dd className="text-sm font-medium text-[var(--color-ink)] sm:text-right">{value}</dd>
    </div>
  );
}

function isValidPhone(phone) {
  return phone.length >= 10 && phone.length <= 15;
}

export default function BookAppointment() {
  const [searchParams] = useSearchParams();
  const preferredDoctorId = Number(searchParams.get("doctor"));

  const {
    doctors,
    slots,
    error,
    clearError,
    loadDoctors,
    loadSlots,
    loadingDoctors,
    loadingSlots,
    resetSlots,
    requestOTP,
    bookAppointment,
  } = useBooking();

  const [step, setStep] = useState(1);
  const [selectedDoctorId, setSelectedDoctorId] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlotId, setSelectedSlotId] = useState(null);
  const [patientForm, setPatientForm] = useState(initialPatientForm);
  const [otp, setOtp] = useState("");
  const [otpState, setOtpState] = useState(initialOtpState);
  const [actionError, setActionError] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [receipt, setReceipt] = useState(null);

  useEffect(() => {
    loadDoctors()
      .then((doctorList) => {
        if (
          Number.isFinite(preferredDoctorId) &&
          doctorList.some((doctor) => doctor.id === preferredDoctorId)
        ) {
          setSelectedDoctorId(preferredDoctorId);
          setStep(2);
        }
      })
      .catch(() => {});
  }, [loadDoctors, preferredDoctorId]);

  useEffect(() => {
    if (selectedDoctorId && step === 1) {
      setStep(2);
    }
  }, [selectedDoctorId, step]);

  const selectedDoctor = doctors.find((doctor) => doctor.id === selectedDoctorId);
  const selectedDoctorProfile = selectedDoctor
    ? getDoctorProfileContent(selectedDoctor)
    : null;
  const selectedSlot = slots.find((slot) => slot.id === selectedSlotId);
  const visibleError = actionError || error;

  const selectedSummary = {
    doctor: selectedDoctorProfile ? selectedDoctorProfile.name : "Not selected",
    date: selectedDate ? formatDateLabel(selectedDate) : "Not selected",
    slot: selectedSlot
      ? formatTimeRange(selectedSlot.start_time, selectedSlot.end_time)
      : "Not selected",
    patient: patientForm.name || "Not added yet",
    phone: patientForm.phone || "Not added yet",
  };

  function jumpBack(targetStep) {
    if (targetStep < step) {
      if (targetStep === 1) {
        setSelectedDoctorId(null);
        setSelectedDate("");
        setSelectedSlotId(null);
        resetSlots();
      }
      setStep(targetStep);
      setActionError("");
    }
  }

  function handleDoctorSelect(doctorId) {
    clearError();
    setActionError("");
    setReceipt(null);
    setSelectedDoctorId(doctorId);
    setSelectedDate("");
    setSelectedSlotId(null);
    setOtp("");
    setOtpState(initialOtpState);
    resetSlots();
    setStep(2);
  }

  async function handleLoadSchedule() {
    if (!selectedDoctorId || !selectedDate) {
      setActionError("Choose both a doctor and a visit date first.");
      return;
    }

    clearError();
    setActionError("");
    setSelectedSlotId(null);

    try {
      await loadSlots(selectedDoctorId, selectedDate);
      setStep(3);
    } catch (requestError) {
      setActionError(
        getApiErrorMessage(requestError, "We could not load the slots for that date."),
      );
    }
  }

  function handlePatientFieldChange(field, value) {
    setPatientForm((current) => ({
      ...current,
      [field]: value,
    }));

    if (field === "phone" && otpState.requested && value !== otpState.phone) {
      setOtp("");
      setOtpState(initialOtpState);
    }
  }

  function handleContinueToVerification() {
    if (!selectedSlotId) {
      setActionError("Pick a time slot before continuing.");
      return;
    }

    if (!patientForm.name.trim()) {
      setActionError("Enter the patient name.");
      return;
    }

    if (!patientForm.age || Number(patientForm.age) <= 0) {
      setActionError("Enter a valid patient age.");
      return;
    }

    if (!isValidPhone(patientForm.phone)) {
      setActionError("Enter a valid phone number before verification.");
      return;
    }

    clearError();
    setActionError("");
    setStep(5);
  }

  async function handleRequestOtp() {
    if (!isValidPhone(patientForm.phone)) {
      setActionError("Enter a valid phone number before requesting the code.");
      return;
    }

    clearError();
    setActionError("");
    setOtpState((current) => ({
      ...current,
      loading: true,
    }));

    try {
      const response = await requestOTP(patientForm.phone);
      setOtpState({
        requested: true,
        loading: false,
        message: response.message || "Verification code sent.",
        debugOtp: response.debug_otp || "",
        phone: patientForm.phone,
      });
    } catch (requestError) {
      setOtpState(initialOtpState);
      setActionError(
        getApiErrorMessage(requestError, "We could not send the verification code."),
      );
    }
  }

  async function handleConfirmAppointment() {
    if (!otpState.requested) {
      setActionError("Request the verification code first.");
      return;
    }

    if (otp.length !== 6) {
      setActionError("Enter the 6-digit verification code.");
      return;
    }

    clearError();
    setActionError("");
    setBookingLoading(true);

    try {
      const response = await bookAppointment({
        phone_number: patientForm.phone,
        otp,
        slot_id: selectedSlotId,
        name: patientForm.name.trim(),
        age: Number(patientForm.age),
        sex: patientForm.sex,
      });

      setReceipt(response.appointment || null);
      setStep(6);
    } catch (requestError) {
      setActionError(
        getApiErrorMessage(requestError, "We could not confirm the appointment."),
      );
    } finally {
      setBookingLoading(false);
    }
  }

  function startAnotherBooking() {
    setStep(1);
    setSelectedDoctorId(null);
    setSelectedDate("");
    setSelectedSlotId(null);
    setPatientForm(initialPatientForm);
    setOtp("");
    setOtpState(initialOtpState);
    setActionError("");
    setReceipt(null);
    resetSlots();
  }

  return (
    <div className="space-y-6 py-4 sm:space-y-8 sm:py-6 lg:py-8">
      <section className="space-y-4">
        <div className="rounded-[28px] border border-[var(--color-line)] bg-[linear-gradient(145deg,var(--color-paper),#f8fcfb)] p-5 shadow-[0_22px_52px_rgba(36,53,51,0.06)] sm:p-7">
          <p className="text-[11px] uppercase tracking-[0.3em] text-[var(--color-wood)]">
            Appointment pipeline
          </p>
          <h1 className="mt-4 font-serif text-3xl leading-tight text-[var(--color-ink)] sm:text-4xl">
            Book a specialist ENT visit with a clean, mobile-first flow.
          </h1>
          <p className="mt-4 text-sm leading-7 text-[var(--color-mist)]">
            Patients can move from doctor profile to schedule, details, and confirmation without
            unnecessary clutter.
          </p>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span className="inline-flex self-start rounded-full border border-[var(--color-line)] bg-white px-4 py-2 text-[11px] uppercase tracking-[0.22em] text-[var(--color-wood)]">
              Step {step} of 6
            </span>
            <Link
              className="text-sm font-semibold text-[var(--color-cyan-deep)] transition hover:text-[var(--color-wood-deep)]"
              to="/"
            >
              Return home
            </Link>
          </div>
        </div>

        <div className="no-scrollbar flex gap-3 overflow-x-auto pb-1 lg:grid lg:grid-cols-3 lg:overflow-visible xl:grid-cols-6">
          {bookingSteps.map((item) => {
            const isActive = step === item.step;
            const isComplete = step > item.step;

            return (
              <button
                key={item.step}
                type="button"
                onClick={() => jumpBack(item.step)}
                className={`min-w-[220px] rounded-[22px] border px-4 py-4 text-left transition lg:min-w-0 ${isActive ? "border-[rgba(45,124,119,0.3)] bg-[var(--color-cyan-soft)]" : "border-[var(--color-line)] bg-[var(--color-paper-soft)]"} ${item.step < step ? "hover:border-[rgba(138,102,72,0.24)] hover:bg-[var(--color-paper)]" : ""}`}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${isComplete ? "bg-[var(--color-cyan-deep)] text-white" : isActive ? "bg-white text-[var(--color-cyan-deep)]" : "border border-[var(--color-line)] text-[var(--color-mist)]"}`}
                  >
                    {item.step}
                  </span>

                  <div>
                    <p className="font-semibold text-[var(--color-ink)]">{item.title}</p>
                    <p className="mt-1 text-sm leading-6 text-[var(--color-mist)]">
                      {item.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.08fr_0.92fr]">
        <aside className="order-1 rounded-[28px] border border-[var(--color-line)] bg-[linear-gradient(145deg,#fefcf8,#ffffff)] p-5 shadow-[0_22px_52px_rgba(36,53,51,0.05)] sm:p-6 xl:order-2">
          <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--color-wood)]">
            Live summary
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-[var(--color-ink)]">
            Current booking state
          </h2>

          <dl className="mt-5">
            <SummaryRow label="Doctor" value={selectedSummary.doctor} />
            <SummaryRow label="Date" value={selectedSummary.date} />
            <SummaryRow label="Time" value={selectedSummary.slot} />
            <SummaryRow label="Patient" value={selectedSummary.patient} />
            <SummaryRow label="Phone" value={selectedSummary.phone} />
          </dl>

          {selectedDoctorProfile ? (
            <div className="mt-5 rounded-[22px] border border-[var(--color-line)] bg-[var(--color-cyan-soft)] p-4">
              <p className="text-sm font-semibold text-[var(--color-ink)]">
                {selectedDoctorProfile.name}
              </p>
              <p className="mt-1 text-sm text-[var(--color-cyan-deep)]">
                {selectedDoctorProfile.credentials}
              </p>
              <p className="mt-3 text-sm leading-7 text-[var(--color-mist)]">
                {selectedDoctorProfile.careStyle}
              </p>
            </div>
          ) : (
            <div className="mt-5 rounded-[22px] border border-dashed border-[var(--color-line)] bg-[var(--color-paper-soft)] p-4 text-sm leading-7 text-[var(--color-mist)]">
              Select the doctor first to see the full visit summary here.
            </div>
          )}
        </aside>

        <section className="order-2 rounded-[28px] border border-[var(--color-line)] bg-[var(--color-paper)] p-5 shadow-[0_22px_52px_rgba(36,53,51,0.05)] sm:p-7 xl:order-1">
          <div className="mb-6">
            <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--color-wood)]">
              Booking workspace
            </p>
            <h2 className="mt-2 font-serif text-3xl text-[var(--color-ink)]">
              Complete the appointment setup
            </h2>
          </div>

        {visibleError ? (
          <div className="mb-6 rounded-[22px] border border-[rgba(164,79,79,0.18)] bg-[rgba(164,79,79,0.08)] px-4 py-3 text-sm text-[var(--color-danger)]">
            {visibleError}
          </div>
        ) : null}

        {step === 1 ? (
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-semibold text-[var(--color-ink)]">
                Choose the doctor profile
              </h3>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--color-mist)]">
                This clinic flow starts with the consultant profile so patients understand who they
                are booking with before selecting a date.
              </p>
            </div>

            {loadingDoctors && !doctors.length ? (
              <div className="rounded-[24px] border border-[var(--color-line)] bg-[var(--color-paper-soft)] p-5 text-sm text-[var(--color-mist)]">
                Loading doctor profile...
              </div>
            ) : (
              <DoctorList
                doctors={doctors}
                onSelect={handleDoctorSelect}
                selectedDoctorId={selectedDoctorId}
              />
            )}

            {selectedDoctorProfile ? (
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button className="w-full sm:w-auto" onClick={() => setStep(2)}>
                  Continue to date selection
                </Button>
                <Button
                  className="w-full sm:w-auto"
                  onClick={() => setSelectedDoctorId(null)}
                  variant="ghost"
                >
                  Choose a different doctor
                </Button>
              </div>
            ) : null}
          </div>
        ) : null}

        {step === 2 ? (
          <div className="grid gap-4 lg:grid-cols-[1.02fr_0.98fr]">
            <div className="space-y-5">
              <div>
                <h3 className="text-2xl font-semibold text-[var(--color-ink)]">
                  Choose a visit date
                </h3>
                <p className="mt-2 text-sm leading-7 text-[var(--color-mist)]">
                  Select the day first, then load the schedule published for this consultant.
                </p>
              </div>

              <div className="rounded-[24px] border border-[var(--color-line)] bg-[var(--color-paper-soft)] p-4 sm:p-5">
                <label className="text-sm font-medium text-[var(--color-ink)]" htmlFor="visit-date">
                  Visit date
                </label>
                <input
                  id="visit-date"
                  className={`${fieldClassName} mt-3`}
                  min={new Date().toISOString().split("T")[0]}
                  type="date"
                  value={selectedDate}
                  onChange={(event) => setSelectedDate(event.target.value)}
                />
                <p className="mt-3 text-sm text-[var(--color-mist)]">
                  Choose a future date to see the live time slots for the selected doctor.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button className="w-full sm:w-auto" onClick={handleLoadSchedule} variant="primary">
                  {loadingSlots ? "Loading schedule..." : "Show schedule"}
                </Button>
                <Button className="w-full sm:w-auto" onClick={() => jumpBack(1)} variant="ghost">
                  Back to doctor list
                </Button>
              </div>
            </div>

            {selectedDoctorProfile ? (
              <div className="rounded-[24px] border border-[var(--color-line)] bg-[linear-gradient(145deg,#eef7f5,#ffffff)] p-5">
                <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--color-wood)]">
                  Selected doctor
                </p>
                <h4 className="mt-3 text-xl font-semibold text-[var(--color-ink)]">
                  {selectedDoctorProfile.name}
                </h4>
                <p className="mt-1 text-sm text-[var(--color-cyan-deep)]">
                  {selectedDoctorProfile.credentials}
                </p>
                <p className="mt-4 text-sm leading-7 text-[var(--color-mist)]">
                  {selectedDoctorProfile.summary}
                </p>
              </div>
            ) : null}
          </div>
        ) : null}

        {step === 3 ? (
          <div className="space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h3 className="text-2xl font-semibold text-[var(--color-ink)]">
                  Choose a time slot
                </h3>
                <p className="mt-2 text-sm leading-7 text-[var(--color-mist)]">
                  Available times are grouped by part of the day for a simpler schedule view.
                </p>
              </div>
              <div className="rounded-full border border-[var(--color-line)] bg-[var(--color-paper-soft)] px-4 py-2 text-sm text-[var(--color-mist)]">
                {selectedDate ? formatDateLabel(selectedDate) : "Date not selected"}
              </div>
            </div>

            {loadingSlots ? (
              <div className="rounded-[24px] border border-[var(--color-line)] bg-[var(--color-paper-soft)] p-5 text-sm text-[var(--color-mist)]">
                Loading slots...
              </div>
            ) : slots.length ? (
              <SlotGrid
                onSelect={(slotId) => {
                  setSelectedSlotId(slotId);
                  setStep(4);
                  setActionError("");
                }}
                selectedSlotId={selectedSlotId}
                slots={slots}
              />
            ) : (
              <div className="rounded-[24px] border border-dashed border-[var(--color-line)] bg-[var(--color-paper-soft)] p-6 text-center">
                <p className="text-lg font-semibold text-[var(--color-ink)]">
                  No schedule was published for that day.
                </p>
                <p className="mt-2 text-sm leading-7 text-[var(--color-mist)]">
                  Try another date or check again later for newly published slots.
                </p>
              </div>
            )}

            <Button className="w-full sm:w-auto" onClick={() => jumpBack(2)} variant="ghost">
              Back to date selection
            </Button>
          </div>
        ) : null}

        {step === 4 ? (
          <div className="grid gap-4 lg:grid-cols-[1.02fr_0.98fr]">
            <div className="space-y-5">
              <div>
                <h3 className="text-2xl font-semibold text-[var(--color-ink)]">
                  Add patient details
                </h3>
                <p className="mt-2 text-sm leading-7 text-[var(--color-mist)]">
                  Add the patient details required to finish the appointment booking.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm font-medium text-[var(--color-ink)]">
                  <span>Patient name</span>
                  <input
                    className={fieldClassName}
                    placeholder="Enter full name"
                    type="text"
                    value={patientForm.name}
                    onChange={(event) =>
                      handlePatientFieldChange("name", event.target.value)
                    }
                  />
                </label>

                <label className="space-y-2 text-sm font-medium text-[var(--color-ink)]">
                  <span>Age</span>
                  <input
                    className={fieldClassName}
                    min="1"
                    placeholder="Age"
                    type="number"
                    value={patientForm.age}
                    onChange={(event) =>
                      handlePatientFieldChange("age", event.target.value)
                    }
                  />
                </label>

                <label className="space-y-2 text-sm font-medium text-[var(--color-ink)]">
                  <span>Sex</span>
                  <select
                    className={fieldClassName}
                    value={patientForm.sex}
                    onChange={(event) =>
                      handlePatientFieldChange("sex", event.target.value)
                    }
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </label>

                <label className="space-y-2 text-sm font-medium text-[var(--color-ink)]">
                  <span>Phone number</span>
                  <input
                    className={fieldClassName}
                    inputMode="numeric"
                    maxLength={15}
                    placeholder="Enter phone number"
                    type="tel"
                    value={patientForm.phone}
                    onChange={(event) =>
                      handlePatientFieldChange(
                        "phone",
                        event.target.value.replace(/\D/g, "").slice(0, 15),
                      )
                    }
                  />
                </label>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button className="w-full sm:w-auto" onClick={handleContinueToVerification}>
                  Continue to verification
                </Button>
                <Button className="w-full sm:w-auto" onClick={() => jumpBack(3)} variant="ghost">
                  Back to time slots
                </Button>
              </div>
            </div>

            <div className="rounded-[24px] border border-[var(--color-line)] bg-[linear-gradient(145deg,#fffdf9,#ffffff)] p-5">
              <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--color-wood)]">
                Visit snapshot
              </p>
              <h4 className="mt-3 text-xl font-semibold text-[var(--color-ink)]">
                {selectedDoctorProfile?.name}
              </h4>
              <p className="mt-1 text-sm text-[var(--color-cyan-deep)]">
                {selectedDoctorProfile?.currentPracticeShort}
              </p>
              <p className="mt-4 text-sm text-[var(--color-mist)]">
                {selectedDate ? formatDateLabel(selectedDate) : ""}
              </p>
              <p className="mt-2 text-lg font-semibold text-[var(--color-ink)]">
                {selectedSlot
                  ? formatTimeRange(selectedSlot.start_time, selectedSlot.end_time)
                  : "No slot selected"}
              </p>
            </div>
          </div>
        ) : null}

        {step === 5 ? (
          <div className="grid gap-4 lg:grid-cols-[1.02fr_0.98fr]">
            <div className="space-y-5">
              <div>
                <h3 className="text-2xl font-semibold text-[var(--color-ink)]">
                  Verify the phone and confirm
                </h3>
                <p className="mt-2 text-sm leading-7 text-[var(--color-mist)]">
                  This step confirms the booking while keeping the visit setup simple.
                </p>
              </div>

              <div className="rounded-[24px] border border-[var(--color-line)] bg-[var(--color-paper-soft)] p-4 sm:p-5">
                <p className="text-sm font-semibold text-[var(--color-ink)]">Step 1: send the OTP</p>
                <p className="mt-2 text-sm leading-7 text-[var(--color-mist)]">
                  We will send the verification code to {patientForm.phone || "the patient phone number"}.
                </p>
                <Button className="mt-4 w-full sm:w-auto" onClick={handleRequestOtp} variant="secondary">
                  {otpState.loading ? "Sending code..." : otpState.requested ? "Resend code" : "Send code"}
                </Button>
              </div>

              {otpState.requested ? (
                <div className="rounded-[24px] border border-[var(--color-line)] bg-[var(--color-paper-soft)] p-4 sm:p-5">
                  <p className="text-sm font-semibold text-[var(--color-ink)]">Step 2: enter the OTP</p>
                  <p className="mt-2 text-sm text-[var(--color-mist)]">
                    {otpState.message}
                  </p>

                  {otpState.debugOtp ? (
                    <div className="mt-4 rounded-[20px] border border-[rgba(138,102,72,0.18)] bg-[rgba(138,102,72,0.08)] px-4 py-3 text-sm text-[var(--color-wood-deep)]">
                      Dev mode OTP: <span className="font-semibold">{otpState.debugOtp}</span>
                    </div>
                  ) : null}

                  <label className="mt-4 block space-y-2 text-sm font-medium text-[var(--color-ink)]">
                    <span>Verification code</span>
                    <input
                      className={fieldClassName}
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="Enter 6-digit code"
                      type="text"
                      value={otp}
                      onChange={(event) =>
                        setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))
                      }
                    />
                  </label>

                  <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                    <Button className="w-full sm:w-auto" onClick={handleConfirmAppointment} variant="primary">
                      {bookingLoading ? "Confirming..." : "Confirm appointment"}
                    </Button>
                    <Button className="w-full sm:w-auto" onClick={() => jumpBack(4)} variant="ghost">
                      Back to patient details
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="rounded-[24px] border border-[var(--color-line)] bg-[linear-gradient(145deg,#eef7f5,#fff)] p-5">
              <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--color-wood)]">
                Before you confirm
              </p>
              <ul className="mt-4 space-y-3">
                {(selectedDoctorProfile?.expectations || []).map((item) => (
                  <li
                    key={item}
                    className="rounded-[20px] border border-[var(--color-line)] bg-white px-4 py-3 text-sm leading-6 text-[var(--color-ink)]"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}

        {step === 6 ? (
          <div className="space-y-6 text-center">
            <div className="mx-auto flex h-18 w-18 items-center justify-center rounded-full bg-[linear-gradient(135deg,var(--color-cyan),var(--color-cyan-deep))] px-5 py-5 text-2xl font-semibold text-white shadow-[0_18px_36px_rgba(45,124,119,0.16)] sm:h-20 sm:w-20 sm:text-3xl">
              OK
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--color-wood)]">
                Appointment confirmed
              </p>
              <h3 className="mt-3 font-serif text-3xl text-[var(--color-ink)] sm:text-4xl">
                Everything is booked.
              </h3>
              <p className="mt-3 text-sm leading-7 text-[var(--color-mist)]">
                The patient now has a clear summary of the visit, doctor, and selected slot.
              </p>
            </div>

            {receipt ? (
              <div className="mx-auto max-w-2xl rounded-[24px] border border-[var(--color-line)] bg-[var(--color-paper-soft)] p-5 text-left sm:p-6">
                <dl>
                  <SummaryRow
                    label="Doctor"
                    value={selectedDoctorProfile?.name || receipt.doctor_name}
                  />
                  <SummaryRow
                    label="Practice"
                    value={selectedDoctorProfile?.currentPracticeShort || receipt.specialization}
                  />
                  <SummaryRow label="Date" value={formatDateLabel(receipt.date)} />
                  <SummaryRow
                    label="Time"
                    value={formatTimeRange(receipt.start_time, receipt.end_time)}
                  />
                  <SummaryRow label="Patient" value={receipt.name} />
                  <SummaryRow label="Phone" value={receipt.phone_number} />
                </dl>
              </div>
            ) : null}

            <div className="flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                className="inline-flex w-full items-center justify-center rounded-full bg-[var(--color-cyan-deep)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-cyan)] sm:w-auto"
                to="/"
              >
                Return home
              </Link>
              <Button className="w-full sm:w-auto" onClick={startAnotherBooking} variant="ghost">
                Book another appointment
              </Button>
            </div>
          </div>
        ) : null}
        </section>
      </section>
    </div>
  );
}
