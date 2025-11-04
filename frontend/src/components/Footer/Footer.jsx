import "./Footer.css";
import { Link } from "react-router-dom";
import xLogo from "/x-logo.png"; // Import X logo
import tiktokLogo from "/tiktok-logo.svg"; // Import TikTok logo

function Footer() {
  return (
    <footer className="footer">
        <div className="footer-contacts">
          <Link to="/contact">
            <button className="btn-primary">Book a consultation</button>
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
        <div className="footer-socials">
          <div className="social-icons">
            <a href="https://facebook.com/yourpage" target="_blank" rel="noopener noreferrer">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#1877F2"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.271 0-4.192 1.58-4.192 4.615v3.385z"/></svg>
            </a>
            <a href="https://twitter.com/yourhandle" target="_blank" rel="noopener noreferrer">
              <img src={xLogo} alt="X (Twitter) logo" width="30" height="30" />
            </a>
            <a href="https://instagram.com/yourprofile" target="_blank" rel="noopener noreferrer">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#E4405F"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.204-.012 3.584-.07 4.85-1.691 4.919-4.919 4.919-4.919 4.919-1.265.058-1.644.069-4.849.069-3.204 0-3.584-.012-4.85-.07-3.252-.148-4.771-1.691-4.919-4.919-.058-1.265-.069-1.645-.069-4.849 0-3.204.012-3.584.07-4.85 1.691-4.919 4.919-4.919 4.919-4.919 1.265-.058 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.073 4.948.073 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4s1.791-4 4-4 4 1.79 4 4-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
            </a>
            <a href="https://tiktok.com/@yourprofile" target="_blank" rel="noopener noreferrer">
              <img src={tiktokLogo} alt="TikTok logo" width="30" height="30" />
            </a>
          </div>
        </div>

      <div className="footer-bottom">
        <p>© 2025 Signatures — All Rights Reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
