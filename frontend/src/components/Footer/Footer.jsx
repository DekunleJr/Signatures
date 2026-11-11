import "./Footer.css";
import { Link, useLocation } from "react-router-dom";

// Only marketing pages get the consultation banner; it is noise on forms and account pages.
const CTA_PATHS = ["/about", "/services", "/portfolio"]; // Home has its own CTA section

function Footer() {
  const { pathname } = useLocation();
  const showCta = CTA_PATHS.includes(pathname);
  return (
    <footer className="footer">
      {showCta && (
        <div className="footer-contacts">
          <h2>Let's discuss your interior</h2>
          <p>Get in touch with us for a personalized consultation.</p>
          <Link to="/contact" className="btn-primary btn-lg footer-cta-link">
            Contact Us
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
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </nav>

        <div className="footer-contact">
          <h4>Contact</h4>
          <p>Email: <a href="mailto:info@2125signature.com">info@2125signature.com</a></p>
          <p>Phone: <a href="tel:+2347067176373">+234 706 717 6373</a></p>
          <address>
            <p>Address: Suite 7, His Glory Plaza, Back of H-Medix, Ademola Adetokumbo Cresent, Wuse II, Abuja, Nigeria</p>
          </address>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} 2125 Signature — All Rights Reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
