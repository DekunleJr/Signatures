import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import ThemeToggle from "../ThemeToggle/ThemeToggle";
import "./Navbar.css";
import logo from "../../assets/logo.png";

const LINKS = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/services", label: "Services" },
  { to: "/portfolio", label: "Portfolio" },
  { to: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  // Close the mobile menu whenever the route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Close with Escape
  useEffect(() => {
    if (!isMenuOpen) return;
    const onKey = (e) => e.key === "Escape" && setIsMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isMenuOpen]);

  const links = [...LINKS];
  if (user) links.push({ to: "/dashboard", label: "Dashboard" });
  if (user && user.is_admin) links.push({ to: "/admin", label: "Admin" });

  return (
    <nav className='navbar' aria-label='Main'>
      <Link to='/' className='navbar-brand' aria-label='2125 Signature home'>
        <img
          src={logo}
          alt=''
          className='logo-image'
          width='80'
          height='80'
        />
      </Link>
      <button
        type='button'
        className='menu-toggle'
        onClick={() => setIsMenuOpen((o) => !o)}
        aria-expanded={isMenuOpen}
        aria-controls='primary-navigation'
        aria-label={isMenuOpen ? "Close menu" : "Open menu"}
      >
        <span aria-hidden='true'>{isMenuOpen ? "✕" : "☰"}</span>
      </button>
      <ul
        id='primary-navigation'
        className={`nav-links ${isMenuOpen ? "open" : ""}`}
      >
        {links.map(({ to, label }) => {
          const active = location.pathname === to;
          return (
            <li key={to}>
              <Link
                to={to}
                className={active ? "active" : ""}
                aria-current={active ? "page" : undefined}
              >
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
      <div className={`nav-buttons ${isMenuOpen ? "open" : ""}`}>
        {/* Desktop position: just before the welcome message / Login button */}
        <ThemeToggle className='theme-toggle--desktop' />
        {user ? (
          <>
            <span className='welcome-message'>Welcome, {user.first_name}!</span>
            <button type='button' className='btn' onClick={logout}>
              Logout
            </button>
          </>
        ) : (
          <Link to='/login' state={{ from: location }}>
            <button type='button' className='btn'>
              Login
            </button>
          </Link>
        )}
      </div>
      {/* Phone position: always visible next to the menu button */}
      <ThemeToggle className='theme-toggle--mobile' />
    </nav>
  );
}
