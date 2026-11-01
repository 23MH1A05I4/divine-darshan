import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { getTempleImage, DEFAULT_IMAGE } from "../utils_templeImages";
import { onlyName, onlyPhone, onlyDigits, isValidPhone, isValidName, isValidAge } from "../utils/validators";

// Builds the next 7 days as { value: 'YYYY-MM-DD', label: 'Sat, 20 Sep' } options
const getUpcomingDateOptions = () => {
  const options = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const value = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString("en-IN", {
      weekday: "short",
      day: "2-digit",
      month: "short",
    });
    options.push({ value, label });
  }
  return options;
};

const Booking = () => {
  const { templeId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const dateOptions = getUpcomingDateOptions();

  const [temple, setTemple] = useState(null);
  const [loadingTemple, setLoadingTemple] = useState(true);
  const [error, setError] = useState("");

  const [selectedDate, setSelectedDate] = useState(dateOptions[0].value);
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlotId, setSelectedSlotId] = useState("");

  const [devoteeName, setDevoteeName] = useState("");
  const [age, setAge] = useState("");
  const [mobile, setMobile] = useState("");
  const [numberOfDevotees, setNumberOfDevotees] = useState(1);

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Fetch the temple so we can use its OWN image as this page's background
  useEffect(() => {
    const fetchTemple = async () => {
      setLoadingTemple(true);
      setError("");
      try {
        const { data } = await api.get(`/temples/${templeId}`);
        setTemple(data);
      } catch (err) {
        setError("Temple not found.");
      } finally {
        setLoadingTemple(false);
      }
    };
    fetchTemple();
  }, [templeId]);

  // Fetch slots whenever the temple or selected date changes
  useEffect(() => {
    if (!templeId) return;
    const fetchSlots = async () => {
      setLoadingSlots(true);
      setSelectedSlotId("");
      try {
        const { data } = await api.get(`/slots/${templeId}`, {
          params: { date: selectedDate },
        });
        setSlots(data);
      } catch (err) {
        setSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };
    fetchSlots();
  }, [templeId, selectedDate]);

  const selectedSlot = slots.find((s) => s._id === selectedSlotId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!isAuthenticated) {
      navigate("/login", { state: { from: `/booking/${templeId}` } });
      return;
    }

    if (!selectedSlotId) {
      setFormError("Please select a darshan/pooja slot.");
      return;
    }
    if (!devoteeName || !age || !mobile || !numberOfDevotees) {
      setFormError("Please fill all devotee details.");
      return;
    }
    if (!isValidName(devoteeName)) {
      setFormError("Devotee name should contain only letters.");
      return;
    }
    if (!isValidAge(age)) {
      setFormError("Age must be a valid number between 1 and 120.");
      return;
    }
    if (!isValidPhone(mobile)) {
      setFormError("Mobile number must be a valid 10-digit number.");
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await api.post("/bookings", {
        templeId,
        slotId: selectedSlotId,
        devoteeName,
        age,
        mobile,
        numberOfDevotees,
      });
      navigate(`/booking-confirmation/${data._id}`);
    } catch (err) {
      setFormError(err.response?.data?.message || "Booking failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingTemple) return <p className="info-text">Loading...</p>;
  if (error || !temple) return <p className="info-text error-text">{error || "Temple not found."}</p>;

  // The selected temple's own image becomes this page's blurred background —
  // this is fetched dynamically from MongoDB, never hard-coded per temple.
  const backgroundImage = getTempleImage(temple);

  return (
    <div
      className="booking-page"
      style={{ backgroundImage: `url("${encodeURI(backgroundImage)}")` }}
    >
      <div className="booking-page-overlay">
        <div className="booking-card">
          <h2 className="booking-card-title">🛕 Book Your Divine Darshan</h2>

          <div className="booking-temple-summary">
            <img
              src={getTempleImage(temple)}
              alt={temple.name}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = DEFAULT_IMAGE;
              }}
            />
            <div>
              <h3>{temple.name}</h3>
              <p>📍 {temple.city}, {temple.state}</p>
            </div>
          </div>

          {formError && <div className="alert alert-error">{formError}</div>}

          <form onSubmit={handleSubmit} className="booking-form">
            <label>Select Date</label>
            <div className="date-chip-row">
              {dateOptions.map((opt) => (
                <button
                  type="button"
                  key={opt.value}
                  className={`date-chip ${selectedDate === opt.value ? "active" : ""}`}
                  onClick={() => setSelectedDate(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <label>Available Darshan & Pooja Slots</label>
            {loadingSlots ? (
              <p className="info-text">Loading...</p>
            ) : slots.length === 0 ? (
              <p className="info-text">No slots available for this date.</p>
            ) : (
              <div className="slot-grid">
                {slots.map((slot) => {
                  const remaining = slot.capacity - slot.bookedSeats;
                  const isFull = remaining <= 0;
                  return (
                    <button
                      type="button"
                      key={slot._id}
                      disabled={isFull}
                      className={`slot-card ${selectedSlotId === slot._id ? "active" : ""} ${isFull ? "full" : ""}`}
                      onClick={() => setSelectedSlotId(slot._id)}
                    >
                      <span className="slot-type">{slot.darshanType}</span>
                      <span className="slot-time">{slot.startTime} – {slot.endTime}</span>
                      <span className="slot-availability">
                        {isFull ? "Slot Full" : `Available: ${remaining}`}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            <label>Devotee Name</label>
            <input
              type="text"
              value={devoteeName}
              onChange={(e) => setDevoteeName(onlyName(e.target.value))}
              placeholder="Letters only (e.g. Ravi Kumar)"
              required
            />

            <div className="form-row">
              <div>
                <label>Age</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={age}
                  onChange={(e) => setAge(onlyDigits(e.target.value, 3))}
                  placeholder="Age"
                  required
                />
              </div>
              <div>
                <label>Mobile Number</label>
                <input
                  type="tel"
                  value={mobile}
                  maxLength="10"
                  onChange={(e) => setMobile(onlyPhone(e.target.value))}
                  placeholder="10-digit mobile"
                  required
                />
              </div>
            </div>

            <label>Number of Devotees</label>
            <input
              type="text"
              inputMode="numeric"
              value={numberOfDevotees}
              onChange={(e) => setNumberOfDevotees(onlyDigits(e.target.value, 2))}
              required
            />

            {selectedSlot && (
              <div className="booking-summary-box">
                <h4>Booking Summary</h4>
                <p><strong>Temple:</strong> {temple.name}</p>
                <p><strong>Date:</strong> {selectedDate}</p>
                <p><strong>Darshan/Pooja Type:</strong> {selectedSlot.darshanType}</p>
                <p><strong>Time Slot:</strong> {selectedSlot.startTime} – {selectedSlot.endTime}</p>
                {devoteeName && <p><strong>Devotee Name:</strong> {devoteeName}</p>}
                <p><strong>Number of Devotees:</strong> {numberOfDevotees}</p>
              </div>
            )}

            <button type="submit" className="btn btn-solid btn-full btn-lg" disabled={submitting}>
              {submitting ? "Confirming..." : "Confirm Booking"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Booking;
