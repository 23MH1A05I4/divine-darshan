import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate("/");
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo" onClick={closeMenu}>
          🛕 <span>Divine Darshan</span>
        </Link>

        <button
          className="navbar-toggle"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label="Toggle menu"
        >
          ☰
        </button>

        <div className={`navbar-links ${menuOpen ? "open" : ""}`}>
          <Link to="/" onClick={closeMenu}>Home</Link>
          <Link to="/temples" onClick={closeMenu}>Temples</Link>
          <Link to="/about" onClick={closeMenu}>About</Link>

          {isAuthenticated && (
            <Link to="/my-bookings" onClick={closeMenu}>My Bookings</Link>
          )}

          {isAdmin && (
            <Link to="/admin/dashboard" onClick={closeMenu}>Admin Dashboard</Link>
          )}

          {isAuthenticated ? (
            <>
              <span className="navbar-user">👤 {user?.name?.split(" ")[0]}</span>
              <button className="navbar-logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={closeMenu} className="navbar-btn-outline">
                Login
              </Link>
              <Link to="/register" onClick={closeMenu} className="navbar-btn-solid">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
