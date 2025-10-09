import { useState } from "react";
import { Link, /* useNavigate */ useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Navbar.css";
import logo from "../../assets/logo.jpg"; // Import the logo image

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  // const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    // User remains on the current page after logout
    // navigate(location.pathname, { replace: true }); // No explicit navigation needed, AuthContext handles state
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className='navbar'>
      <Link to="/"> {/* Wrap the logo in a Link to navigate to home */}
        <img src={logo} alt="Signature Logo" className='logo-image' />
      </Link>
      <button className='menu-toggle' onClick={toggleMenu}>
        &#9776; {/* Hamburger icon */}
      </button>
      <ul className={`nav-links ${isMenuOpen ? "open" : ""}`}>
        <li>
          <Link
            to='/'
            className={location.pathname === "/" ? "active" : ""}
            onClick={() => setIsMenuOpen(false)}
          >
            Home
          </Link>
        </li>
        <li>
          <Link
            to='/about'
            className={location.pathname === "/about" ? "active" : ""}
            onClick={() => setIsMenuOpen(false)}
          >
            About
          </Link>
        </li>
        <li>
          <Link
            to='/services'
            className={location.pathname === "/services" ? "active" : ""}
            onClick={() => setIsMenuOpen(false)}
          >
            Services
          </Link>
        </li>
        <li>
          <Link
            to='/portfolio'
            className={location.pathname === "/portfolio" ? "active" : ""}
            onClick={() => setIsMenuOpen(false)}
          >
            Portfolio
          </Link>
        </li>
        <li>
          <Link
            to='/contact'
            className={location.pathname === "/contact" ? "active" : ""}
            onClick={() => setIsMenuOpen(false)}
          >
            Contact
          </Link>
        </li>
        <li>
          <div className={`nav-buttons ${isMenuOpen ? "open" : ""}`}>
            {user ? (
              <>
                <Link
                  to='/dashboard'
                  className={location.pathname === "/dashboard" ? "active" : ""}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
              </>
              ) : null}
          </div>
        </li>
      </ul>
      <div className={`nav-buttons ${isMenuOpen ? "open" : ""}`}>
        {user ? (
          <>
            <span className='welcome-message'>Welcome, {user.first_name}!</span>
            <button className='btn' onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <Link
            to='/login'
            state={{ from: location }}
            onClick={() => setIsMenuOpen(false)}
          >
            <button className='btn'>Login</button>
          </Link>
        )}
      </div>
    </nav>
  );
}
