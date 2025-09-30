import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-about">
          <h3>2125 Signatures</h3>
          <p>
            Crafting timeless and elegant interiors that transform houses into homes
            and offices into experiences.
          </p>
        </div>

        <div className="footer-links">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/about">About</a></li>
            <li><a href="/services">Services</a></li>
            <li><a href="/portfolio">Portfolio</a></li>
            <li><a href="/contact">Contact</a></li>
          </ul>
        </div>

        <div className="footer-contact">
          <h4>Contact</h4>
          <p>Email: info@signatures.com</p>
          <p>Phone: +234 706 274 3233</p>
          <p>Abuja, Nigeria</p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2025 Signatures — All Rights Reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
