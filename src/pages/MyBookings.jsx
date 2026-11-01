import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { getTempleImage, DEFAULT_IMAGE } from "../utils_templeImages";

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState("");
  const [message, setMessage] = useState("");

  const fetchBookings = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/bookings/my");
      setBookings(data);
    } catch (err) {
      setError("Failed to load your bookings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    setCancellingId(bookingId);
    setMessage("");
    try {
      await api.patch(`/bookings/${bookingId}/cancel`);
      setMessage("Booking Cancelled Successfully");
      fetchBookings();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to cancel booking.");
    } finally {
      setCancellingId("");
    }
  };

  return (
    <div className="my-bookings-page">
      <div className="page-header">
        <h1>My Darshan Bookings</h1>
        <p>View and manage all your temple darshan and pooja bookings.</p>
      </div>

      {message && <div className="alert alert-info">{message}</div>}

      {loading ? (
        <p className="info-text">Loading...</p>
      ) : error ? (
        <p className="info-text error-text">{error}</p>
      ) : bookings.length === 0 ? (
        <p className="info-text">
          You have no bookings yet. <Link to="/temples">Explore temples</Link> to book your darshan.
        </p>
      ) : (
        <div className="booking-list">
          {bookings.map((booking) => {
            const temple = booking.temple;
            const slot = booking.slot;
            const isCancelled = booking.status === "CANCELLED";
            return (
              <div key={booking._id} className={`booking-list-card ${isCancelled ? "cancelled" : ""}`}>
                <img
                  src={getTempleImage(temple)}
                  alt={temple?.name}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = DEFAULT_IMAGE;
                  }}
                />
                <div className="booking-list-info">
                  <h3>{temple?.name || "Temple"}</h3>
                  <p>Booking ID: <strong>{booking.bookingId}</strong></p>
                  <p>{booking.bookingDate} · {slot ? `${slot.startTime} – ${slot.endTime}` : ""}</p>
                  <p>{booking.darshanType} · {booking.numberOfDevotees} devotee(s)</p>
                  <span className={`status-badge ${isCancelled ? "status-cancelled" : "status-confirmed"}`}>
                    {booking.status}
                  </span>
                </div>
                <div className="booking-list-actions">
                  <Link to={`/booking-confirmation/${booking._id}`} className="btn btn-outline">
                    View Details
                  </Link>
                  {!isCancelled && (
                    <button
                      className="btn btn-danger"
                      onClick={() => handleCancel(booking._id)}
                      disabled={cancellingId === booking._id}
                    >
                      {cancellingId === booking._id ? "Cancelling..." : "Cancel Booking"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyBookings;
