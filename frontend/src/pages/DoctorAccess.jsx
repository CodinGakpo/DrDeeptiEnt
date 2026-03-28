import { useCallback, useEffect, useState } from "react";

import Button from "../components/Button";
import {
  createDoctorAvailability,
  getDoctorAccessSession,
  getDoctorAvailability,
  loginDoctorAccess,
  logoutDoctorAccess,
  updateDoctorAvailability,
} from "../api/doctorAccess";
import { getApiErrorMessage } from "../utils/api";
import { formatDateLabel, formatTimeRange } from "../utils/formatters";
import { getDoctorProfileContent } from "../utils/doctorProfiles";

const initialCredentials = {
  username: "",
  password: "",
};

const initialAvailabilityForm = {
  date: "",
  start_time: "",
  end_time: "",
  is_active: true,
};

export default function DoctorAccess() {
  const [credentials, setCredentials] = useState(initialCredentials);
  const [availabilityForm, setAvailabilityForm] = useState(initialAvailabilityForm);
  const [authenticated, setAuthenticated] = useState(false);
  const [doctor, setDoctor] = useState(null);
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [error, setError] = useState("");

  const initializeDoctorAccess = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const session = await getDoctorAccessSession();

      if (session.authenticated) {
        const doctorProfile = getDoctorProfileContent(session.doctor);
        setAuthenticated(true);
        setDoctor(doctorProfile);
        await loadAvailability();
      } else {
        setAuthenticated(false);
        setDoctor(null);
        setAvailability([]);
      }
    } catch (requestError) {
      setError(
        getApiErrorMessage(requestError, "We could not load the doctor access session."),
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    initializeDoctorAccess();
  }, [initializeDoctorAccess]);

  async function loadAvailability() {
    const response = await getDoctorAvailability();
    setAvailability(response.availability || []);
    setDoctor(getDoctorProfileContent(response.doctor));
  }

  async function handleLogin(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setStatusMessage("");

    try {
      const response = await loginDoctorAccess(credentials);
      setAuthenticated(true);
      setDoctor(getDoctorProfileContent(response.doctor));
      setStatusMessage("Doctor access granted.");
      setCredentials(initialCredentials);
      await loadAvailability();
    } catch (requestError) {
      setError(
        getApiErrorMessage(requestError, "We could not sign in to doctor access."),
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleLogout() {
    setSubmitting(true);
    setError("");
    setStatusMessage("");

    try {
      await logoutDoctorAccess();
      setAuthenticated(false);
      setDoctor(null);
      setAvailability([]);
      setStatusMessage("Doctor access closed.");
    } catch (requestError) {
      setError(
        getApiErrorMessage(requestError, "We could not sign out right now."),
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCreateAvailability(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setStatusMessage("");

    try {
      await createDoctorAvailability(availabilityForm);
      setAvailabilityForm(initialAvailabilityForm);
      setStatusMessage("Availability added successfully.");
      await loadAvailability();
    } catch (requestError) {
      setError(
        getApiErrorMessage(requestError, "We could not add the availability slot."),
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggleAvailability(item) {
    setSubmitting(true);
    setError("");
    setStatusMessage("");

    try {
      await updateDoctorAvailability(item.id, {
        is_active: !item.is_active,
      });
      setStatusMessage("Availability status updated.");
      await loadAvailability();
    } catch (requestError) {
      setError(
        getApiErrorMessage(requestError, "We could not update the slot status."),
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="py-10">
        <div className="rounded-[32px] border border-[var(--color-line)] bg-[var(--color-paper)] p-6 text-sm text-[var(--color-mist)]">
          Loading doctor access...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-6 md:py-10">
      <section className="mx-auto max-w-5xl rounded-[36px] border border-[var(--color-line)] bg-[linear-gradient(145deg,var(--color-paper),#f8fcfb)] p-7 shadow-[0_24px_60px_rgba(36,53,51,0.08)] md:p-10">
        <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-wood)]">
          Doctor access
        </p>
        <h1 className="mt-4 font-serif text-4xl text-[var(--color-ink)]">
          Private schedule controls
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--color-mist)]">
          This hidden page lets the doctor sign in, publish schedule windows, and set whether an
          availability window is active or inactive.
        </p>

        {error ? (
          <div className="mt-6 rounded-[22px] border border-[rgba(164,79,79,0.18)] bg-[rgba(164,79,79,0.08)] px-4 py-3 text-sm text-[var(--color-danger)]">
            {error}
          </div>
        ) : null}

        {statusMessage ? (
          <div className="mt-6 rounded-[22px] border border-[rgba(45,124,119,0.18)] bg-[rgba(45,124,119,0.08)] px-4 py-3 text-sm text-[var(--color-cyan-deep)]">
            {statusMessage}
          </div>
        ) : null}

        {!authenticated ? (
          <form className="mt-8 grid gap-4 md:grid-cols-2" onSubmit={handleLogin}>
            <label className="space-y-2 text-sm font-medium text-[var(--color-ink)]">
              <span>Username</span>
              <input
                className="w-full rounded-[20px] border border-[var(--color-line)] bg-[var(--color-paper-soft)] px-4 py-3 text-sm text-[var(--color-ink)] outline-none transition focus:border-[rgba(45,124,119,0.32)]"
                type="text"
                value={credentials.username}
                onChange={(event) =>
                  setCredentials((current) => ({
                    ...current,
                    username: event.target.value,
                  }))
                }
              />
            </label>

            <label className="space-y-2 text-sm font-medium text-[var(--color-ink)]">
              <span>Password</span>
              <input
                className="w-full rounded-[20px] border border-[var(--color-line)] bg-[var(--color-paper-soft)] px-4 py-3 text-sm text-[var(--color-ink)] outline-none transition focus:border-[rgba(45,124,119,0.32)]"
                type="password"
                value={credentials.password}
                onChange={(event) =>
                  setCredentials((current) => ({
                    ...current,
                    password: event.target.value,
                  }))
                }
              />
            </label>

            <div className="md:col-span-2">
              <Button disabled={submitting} type="submit">
                {submitting ? "Signing in..." : "Enter doctor access"}
              </Button>
            </div>
          </form>
        ) : (
          <div className="mt-8 space-y-8">
            <div className="flex flex-col gap-4 rounded-[28px] border border-[var(--color-line)] bg-[var(--color-paper-soft)] p-5 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold text-[var(--color-ink)]">
                  {doctor?.name}
                </p>
                <p className="mt-1 text-sm text-[var(--color-cyan-deep)]">
                  {doctor?.currentPractice}
                </p>
              </div>
              <Button className="md:w-auto" disabled={submitting} onClick={handleLogout} variant="ghost">
                {submitting ? "Working..." : "Sign out"}
              </Button>
            </div>

            <section className="grid gap-6 lg:grid-cols-[0.96fr_1.04fr]">
              <form
                className="rounded-[30px] border border-[var(--color-line)] bg-white p-6 shadow-[0_18px_42px_rgba(36,53,51,0.04)]"
                onSubmit={handleCreateAvailability}
              >
                <p className="text-xs uppercase tracking-[0.24em] text-[var(--color-wood)]">
                  Add availability
                </p>
                <div className="mt-5 grid gap-4">
                  <label className="space-y-2 text-sm font-medium text-[var(--color-ink)]">
                    <span>Date</span>
                    <input
                      className="w-full rounded-[18px] border border-[var(--color-line)] bg-[var(--color-paper-soft)] px-4 py-3 text-sm text-[var(--color-ink)] outline-none transition focus:border-[rgba(45,124,119,0.32)]"
                      min={new Date().toISOString().split("T")[0]}
                      type="date"
                      value={availabilityForm.date}
                      onChange={(event) =>
                        setAvailabilityForm((current) => ({
                          ...current,
                          date: event.target.value,
                        }))
                      }
                    />
                  </label>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="space-y-2 text-sm font-medium text-[var(--color-ink)]">
                      <span>Start time</span>
                      <input
                        className="w-full rounded-[18px] border border-[var(--color-line)] bg-[var(--color-paper-soft)] px-4 py-3 text-sm text-[var(--color-ink)] outline-none transition focus:border-[rgba(45,124,119,0.32)]"
                        type="time"
                        value={availabilityForm.start_time}
                        onChange={(event) =>
                          setAvailabilityForm((current) => ({
                            ...current,
                            start_time: event.target.value,
                          }))
                        }
                      />
                    </label>

                    <label className="space-y-2 text-sm font-medium text-[var(--color-ink)]">
                      <span>End time</span>
                      <input
                        className="w-full rounded-[18px] border border-[var(--color-line)] bg-[var(--color-paper-soft)] px-4 py-3 text-sm text-[var(--color-ink)] outline-none transition focus:border-[rgba(45,124,119,0.32)]"
                        type="time"
                        value={availabilityForm.end_time}
                        onChange={(event) =>
                          setAvailabilityForm((current) => ({
                            ...current,
                            end_time: event.target.value,
                          }))
                        }
                      />
                    </label>
                  </div>

                  <label className="flex items-center gap-3 rounded-[18px] border border-[var(--color-line)] bg-[var(--color-paper-soft)] px-4 py-3 text-sm text-[var(--color-ink)]">
                    <input
                      checked={availabilityForm.is_active}
                      type="checkbox"
                      onChange={(event) =>
                        setAvailabilityForm((current) => ({
                          ...current,
                          is_active: event.target.checked,
                        }))
                      }
                    />
                    Publish this slot as active immediately
                  </label>
                </div>

                <Button className="mt-5" disabled={submitting} type="submit">
                  {submitting ? "Saving..." : "Add availability"}
                </Button>
              </form>

              <div className="rounded-[30px] border border-[var(--color-line)] bg-white p-6 shadow-[0_18px_42px_rgba(36,53,51,0.04)]">
                <p className="text-xs uppercase tracking-[0.24em] text-[var(--color-wood)]">
                  Published schedule
                </p>
                <div className="mt-5 space-y-4">
                  {availability.length ? (
                    availability.map((item) => (
                      <article
                        key={item.id}
                        className="rounded-[22px] border border-[var(--color-line)] bg-[var(--color-paper-soft)] p-4"
                      >
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                          <div>
                            <p className="text-sm font-semibold text-[var(--color-ink)]">
                              {formatDateLabel(item.date)}
                            </p>
                            <p className="mt-1 text-sm text-[var(--color-cyan-deep)]">
                              {formatTimeRange(item.start_time, item.end_time)}
                            </p>
                            <p className="mt-2 text-xs uppercase tracking-[0.22em] text-[var(--color-mist)]">
                              {item.slot_count} generated slots | {item.booked_slot_count} booked
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center gap-3">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${item.is_active ? "bg-[rgba(45,124,119,0.12)] text-[var(--color-cyan-deep)]" : "bg-[rgba(138,102,72,0.12)] text-[var(--color-wood-deep)]"}`}
                            >
                              {item.is_active ? "Active" : "Inactive"}
                            </span>

                            <Button
                              className="md:w-auto"
                              disabled={submitting}
                              onClick={() => handleToggleAvailability(item)}
                              size="sm"
                              variant={item.is_active ? "ghost" : "secondary"}
                            >
                              Set {item.is_active ? "inactive" : "active"}
                            </Button>
                          </div>
                        </div>
                      </article>
                    ))
                  ) : (
                    <div className="rounded-[22px] border border-dashed border-[var(--color-line)] bg-[var(--color-paper-soft)] p-5 text-sm text-[var(--color-mist)]">
                      No availability has been added yet.
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>
        )}
      </section>
    </div>
  );
}
