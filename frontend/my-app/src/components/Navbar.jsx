import { Link, useNavigate } from "react-router-dom";
import { useAuth } from '../context/AuthContext';
import './Navbar.css';


export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="logo">Signature</div>
      <ul className="nav-links">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/about">About</Link></li>
        <li><Link to="/services">Services</Link></li>
        <li><Link to="/portfolio">Portfolio</Link></li>
        <li><Link to="/contact">Contact</Link></li>
      </ul>
      <div className="nav-buttons">
        {user ? (
          <>
            <span className="welcome-message">Welcome, {user.first_name}!</span>
            <button className="btn" onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <Link to="/login">
            <button className="btn">Login</button>
          </Link>
        )}
      </div>
    </nav>
  );
}
