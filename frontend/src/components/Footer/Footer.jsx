import "./Footer.css";
import { Link, useLocation } from "react-router-dom";
import tiktokLogo from "/tiktok-logo.svg";

// The consultation banner is for marketing pages; it is noise on forms and account pages.
// (Contact is the booking page itself, so it is excluded there too.)
const CTA_PATHS = ["/", "/about", "/services", "/portfolio"];

function Footer() {
  const { pathname } = useLocation();
  const showCta = CTA_PATHS.includes(pathname);
  return (
    <footer className="footer">
      {showCta && (
        <div className="footer-contacts">
          <Link to="/contact" className="btn-primary btn-lg footer-cta-link">
            Book a consultation
          </Link>
        </div>
      )}
      <div className="footer-container">
        <div className="footer-about">
          <h3>2125 Signature</h3>
          <p>
            Crafting timeless and elegant interiors that transform houses into homes
            and offices into experiences.
          </p>
        </div>

        <nav className="footer-nav" aria-label="Footer">
          <h4>Explore</h4>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/about">About</Link></li>
            <li><Link to="/services">Services</Link></li>
            <li><Link to="/portfolio">Portfolio</Link></li>
            <li><Link to="/contact">Book</Link></li>
          </ul>
        </nav>

        <div className="footer-contact">
          <h4>Contact</h4>
          <p>Email: <a href="mailto:info@2125signature.com">info@2125signature.com</a></p>
          <p>Phone: <a href="tel:+2347017777571">+234 701 777 7571</a></p>
          <address>
            <p>Address: Suite 7, His Glory Plaza, Back of H-Medix, Ademola Adetokumbo Cresent, Wuse II, Abuja, Nigeria</p>
          </address>
        </div>
      </div>

      <div className="footer-socials">
        <div className="social-icons">
          <a href="https://www.instagram.com/2125signature" target="_blank" rel="noopener noreferrer" aria-label="2125 Signature on Instagram">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#E4405F"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.204-.012 3.584-.07 4.85-1.691 4.919-4.919 4.919-4.919 4.919-1.265.058-1.644.069-4.849.069-3.204 0-3.584-.012-4.85-.07-3.252-.148-4.771-1.691-4.919-4.919-.058-1.265-.069-1.645-.069-4.849 0-3.204.012-3.584.07-4.85 1.691-4.919 4.919-4.919 4.919-4.919 1.265-.058 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.073 4.948.073 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4s1.791-4 4-4 4 1.79 4 4-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
          </a>
          <a href="https://www.tiktok.com/@2125signatures" target="_blank" rel="noopener noreferrer" aria-label="2125 Signature on TikTok">
            <img src={tiktokLogo} alt="" width="30" height="30" />
          </a>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} 2125 Signature — All Rights Reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
