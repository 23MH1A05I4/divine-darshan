import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";
import { getTempleImage, DEFAULT_IMAGE } from "../utils_templeImages";

const TempleDetails = () => {
  const { id } = useParams();
  const [temple, setTemple] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTemple = async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await api.get(`/temples/${id}`);
        setTemple(data);
      } catch (err) {
        setError("Temple not found.");
      } finally {
        setLoading(false);
      }
    };
    fetchTemple();
  }, [id]);

  if (loading) return <p className="info-text">Loading...</p>;
  if (error || !temple) return <p className="info-text error-text">{error || "Temple not found."}</p>;

  const allServices = [...(temple.darshanTypes || []), ...(temple.poojaTypes || [])];

  const backgroundImage = getTempleImage(temple);

  return (
    <div
      className="booking-page temple-details-page-wrap"
      style={{ backgroundImage: `url("${encodeURI(backgroundImage)}")` }}
    >
      <div className="booking-page-overlay" style={{ padding: "2rem 1rem", width: "100%" }}>
        <div className="temple-details-page">
          <div className="temple-details-hero">
            <img
              src={getTempleImage(temple)}
              alt={temple.name}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = DEFAULT_IMAGE;
              }}
            />
          </div>

      <div className="temple-details-content">
        <h1>{temple.name}</h1>
        <p className="temple-details-location">
          📍 {temple.city}, {temple.state} {temple.location ? `— ${temple.location}` : ""}
        </p>

        {temple.description && (
          <div className="temple-details-section">
            <h3>About</h3>
            <p>{temple.description}</p>
          </div>
        )}

        {temple.history && (
          <div className="temple-details-section">
            <h3>History</h3>
            <p>{temple.history}</p>
          </div>
        )}

        <div className="temple-details-grid">
          <div className="temple-details-section">
            <h3>Timings</h3>
            <p>{temple.timings || "Not specified"}</p>
          </div>
          <div className="temple-details-section">
            <h3>Address</h3>
            <p>{temple.address || "Not specified"}</p>
          </div>
        </div>

        <div className="temple-details-section">
          <h3>Available Darshan & Pooja</h3>
          {allServices.length === 0 ? (
            <p>No services configured for this temple yet.</p>
          ) : (
            <div className="service-chips">
              {allServices.map((service) => (
                <span key={service} className="service-chip">{service}</span>
              ))}
            </div>
          )}
        </div>

        <Link to={`/booking/${temple._id}`} className="btn btn-solid btn-lg">
          Book Darshan
        </Link>
      </div>
    </div>
  </div>
</div>
  );
};

export default TempleDetails;
