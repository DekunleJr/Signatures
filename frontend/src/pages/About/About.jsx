import "./About.css";
import aboutHeader from "../../assets/about-header.jpg";

function About() {
  const aboutInfo = {
    heading: "The Art of Signature Interiors and Seamless Execution",
    paragraphs: [
      "At 2125 Signature, we believe in the transformative power of design.",
      " Our expertise covers every major area from Kitchen, Living, Dining, and ",
      "Bedroom, delivering a seamless experience from concept to completion. We don't",
      "just design rooms, we execute refined environments where every detail contributes",
      "to a comfortable and luxurious ambiance, allowing you to live exceptionally.",
      "We stand by our work, ensuring a high standard of quality in every project",
    ],
    image: aboutHeader,
  };

  return (
    <section className='about-section'>
      <div className='about-hero'>
        <div className='about-hero-text'>
          <h2>{aboutInfo.heading}</h2>
          {aboutInfo.paragraphs.map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
        <div className='about-hero-image'>
          <img src={aboutInfo.image} alt='About 2125 Signatures' />
        </div>
      </div>

      <div className='about-values'>
        {/* Example values block — you can fetch from backend too */}
        <div className='value-box'>
          <h3>Vision</h3>
          <p>To be the leading interior design firm recognized for redefining modern living through innovative, comfortable, and personalized design solutions.</p>
        </div>
        <div className='value-box'>
          <h3>Mission</h3>
          <p>To transform every client's vision into an exquisitely executed reality by providing comprehensive, high-quality design services, backed by exceptional project management and a commitment to lasting craftsmanship.</p>
        </div>
        <div className='value-box'>
          <h3>Philosophy</h3>
          <p>Our philosophy is rooted in the belief that an environment should be a true extension of its occupant's identity. We strive to deliver spaces where real comfort, both visual and physical, is vital, ensuring the interiors profoundly reflect your unique style and enhance your overall well-being.</p>
        </div>
      </div>
    </section>
  );
}

export default About;
