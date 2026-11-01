import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../services/api";
import TempleCard from "../components/TempleCard";

const Temples = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [temples, setTemples] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchTemples = async (search) => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/temples", {
        params: search ? { search } : {},
      });
      setTemples(data);
    } catch (err) {
      setError("Failed to load temples. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemples(searchParams.get("search") || "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm) {
      setSearchParams({ search: searchTerm });
    } else {
      setSearchParams({});
    }
  };

  return (
    <div className="temples-page">
      <div className="page-header">
        <h1>Temples Across India</h1>
        <p>Search and explore sacred temples from every corner of the country.</p>
      </div>

      <form className="search-box" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search by name, city or state..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button type="submit" className="btn btn-solid">Search Temple</button>
      </form>

      {loading ? (
        <p className="info-text">Loading...</p>
      ) : error ? (
        <p className="info-text error-text">{error}</p>
      ) : temples.length === 0 ? (
        <p className="info-text">No temples found.</p>
      ) : (
        <div className="temple-grid">
          {temples.map((temple) => (
            <TempleCard key={temple._id} temple={temple} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Temples;
