import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";
import { getTempleImage, DEFAULT_IMAGE } from "../utils_templeImages";

const BookingConfirmation = () => {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBooking = async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await api.get(`/bookings/${id}`);
        setBooking(data);
      } catch (err) {
        setError("Booking not found.");
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [id]);

  if (loading) return <p className="info-text">Loading...</p>;
  if (error || !booking) return <p className="info-text error-text">{error || "Booking not found."}</p>;

  const temple = booking.temple;
  const slot = booking.slot;
  const backgroundImage = getTempleImage(temple);
  const isCancelled = booking.status === "CANCELLED";

  return (
    <div
      className="booking-page"
      style={{ backgroundImage: `url("${encodeURI(backgroundImage)}")` }}
    >
      <div className="booking-page-overlay">
        <div className="confirmation-card">
          <h2 className={`confirmation-heading ${isCancelled ? "cancelled" : ""}`}>
            {isCancelled ? "✕ Darshan Booking Cancelled" : "✓ Darshan Booking Confirmed"}
          </h2>

          <div className="confirmation-body">
            <div className="confirmation-details">
              <div className="confirmation-row">
                <span>Booking ID</span>
                <strong>{booking.bookingId}</strong>
              </div>
              <div className="confirmation-row">
                <span>Temple</span>
                <strong>{temple?.name}</strong>
              </div>
              <div className="confirmation-row">
                <span>Date</span>
                <strong>{booking.bookingDate}</strong>
              </div>
              <div className="confirmation-row">
                <span>Time</span>
                <strong>{slot ? `${slot.startTime} – ${slot.endTime}` : "-"}</strong>
              </div>
              <div className="confirmation-row">
                <span>Darshan/Pooja Type</span>
                <strong>{booking.darshanType}</strong>
              </div>
              <div className="confirmation-row">
                <span>Number of Devotees</span>
                <strong>{booking.numberOfDevotees}</strong>
              </div>
              <div className="confirmation-row">
                <span>Devotee Name</span>
                <strong>{booking.devoteeName}</strong>
              </div>
              <div className="confirmation-row">
                <span>Mobile</span>
                <strong>{booking.mobile}</strong>
              </div>
              <div className="confirmation-row">
                <span>Status</span>
                <strong className={`status-badge ${isCancelled ? "status-cancelled" : "status-confirmed"}`}>
                  {booking.status}
                </strong>
              </div>
            </div>

            <div className="confirmation-image">
              <img
                src={getTempleImage(temple)}
                alt={temple?.name}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = DEFAULT_IMAGE;
                }}
              />
            </div>
          </div>

          <div className="confirmation-actions">
            <Link to="/my-bookings" className="btn btn-solid">View My Bookings</Link>
            <Link to="/temples" className="btn btn-outline">Explore More Temples</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;
