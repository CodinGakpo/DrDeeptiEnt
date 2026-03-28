import { useCallback, useState } from "react";
import {
  getDoctors,
  getSlots,
  requestOTP,
  bookAppointment,
} from "../api/booking";
import { getApiErrorMessage } from "../utils/api";

export function useBooking() {
  const [doctors, setDoctors] = useState([]);
  const [slots, setSlots] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [error, setError] = useState("");

  const loadDoctors = useCallback(async () => {
    setLoadingDoctors(true);
    setError("");

    try {
      const doctorData = await getDoctors();
      setDoctors(doctorData);
      return doctorData;
    } catch (requestError) {
      const message = getApiErrorMessage(
        requestError,
        "We could not load the doctors right now.",
      );
      setError(message);
      throw requestError;
    } finally {
      setLoadingDoctors(false);
    }
  }, []);

  const loadSlots = useCallback(async (doctorId, date) => {
    setLoadingSlots(true);
    setError("");

    try {
      const slotData = await getSlots(doctorId, date);
      setSlots(slotData);
      return slotData;
    } catch (requestError) {
      const message = getApiErrorMessage(
        requestError,
        "We could not load the schedule for that day.",
      );
      setError(message);
      throw requestError;
    } finally {
      setLoadingSlots(false);
    }
  }, []);

  const resetSlots = useCallback(() => {
    setSlots([]);
  }, []);

  const clearError = useCallback(() => {
    setError("");
  }, []);

  return {
    doctors,
    slots,
    loading: loadingDoctors || loadingSlots,
    loadingDoctors,
    loadingSlots,
    error,
    clearError,
    loadDoctors,
    loadSlots,
    resetSlots,
    requestOTP,
    bookAppointment,
  };
}
