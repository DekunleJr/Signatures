import { useState } from "react";
import { Link, /* useNavigate */ useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Navbar.css";

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
      <div className='logo'>Signature</div>
      <button className='menu-toggle' onClick={toggleMenu}>
        &#9776; {/* Hamburger icon */}
      </button>
      <ul className={`nav-links ${isMenuOpen ? "open" : ""}`}>
        <li>
          <Link to='/' onClick={() => setIsMenuOpen(false)}>
            Home
          </Link>
        </li>
        <li>
          <Link to='/about' onClick={() => setIsMenuOpen(false)}>
            About
          </Link>
        </li>
        <li>
          <Link to='/services' onClick={() => setIsMenuOpen(false)}>
            Services
          </Link>
        </li>
        <li>
          <Link to='/portfolio' onClick={() => setIsMenuOpen(false)}>
            Portfolio
          </Link>
        </li>
        <li>
          <Link to='/contact' onClick={() => setIsMenuOpen(false)}>
            Contact
          </Link>
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
