function Contact() {
  return (
    <section className="page contact">
      <h2>Contact Us</h2>
      <p>We’d love to bring your dream space to life.</p>
      <form className="contact-form">
        <input type="text" placeholder="Your Name" required />
        <input type="email" placeholder="Your Email" required />
        <textarea placeholder="Your Message" required></textarea>
        <button type="submit" className="btn">Send Message</button>
      </form>
    </section>
  );
}

export default Contact;
