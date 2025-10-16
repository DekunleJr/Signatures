import "./Footer.css";
import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="footer">
        <div className="footer-contacts">
          <h3>Let's discuss about your interior</h3>
          <p>Get in touch with us for a personalized consultation.</p>
          <Link to="/contact">
            <button className="btn-primary">Contact Us</button>
          </Link>
        </div>
      <div className="footer-container">
        <div className="footer-about">
          <h3>2125 Signature</h3>
          <p>
            Crafting timeless and elegant interiors that transform houses into homes
            and offices into experiences.
          </p>
        </div>


        <div className="footer-contact">
          <h4>Contact</h4>
          <p>Email: info@2125signature.com</p>
          <p>Phone: +234 706 717 6373</p>
          <address>
            <p>Address: Suite 7, His Glory Plaza, Back of H-Medix, Ademola Adetokumbo Cresent, Wuse II, Abuja, Nigeria</p>
          </address>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2025 Signatures — All Rights Reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
