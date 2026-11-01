import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import TempleCard from "../components/TempleCard";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1600100397608-f9932a1f63c6?q=80&w=1920&auto=format&fit=crop";

const Home = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [temples, setTemples] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedTemples = async () => {
      try {
        const { data } = await api.get("/temples");
        setTemples(data.slice(0, 6));
      } catch (error) {
        console.error("Failed to load temples", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeaturedTemples();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/temples${searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : ""}`);
  };

  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">DIVINE DARSHAN</div>
          <h1>Welcome to Divine Darshan</h1>
          <p>Discover sacred temples across India and reserve your preferred darshan and pooja slots with ease.</p>
          <button className="btn btn-solid btn-lg" onClick={() => navigate("/temples")}>
            Explore Temples
          </button>
        </div>
      </section>

      <section className="search-section">
        <h2>Find Your Temple</h2>
        <form className="search-box" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search temple, city or state..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit" className="btn btn-solid">Search Temple</button>
        </form>
      </section>

      <section className="featured-temples">
        <h2>Featured Temples</h2>
        {loading ? (
          <p className="info-text">Loading...</p>
        ) : temples.length === 0 ? (
          <p className="info-text">No temples found.</p>
        ) : (
          <div className="temple-grid">
            {temples.map((temple) => (
              <TempleCard key={temple._id} temple={temple} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
