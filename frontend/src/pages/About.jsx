import { useState, useEffect } from "react";
import "./About.css";
import aboutHeader from "../assets/about-header.jpg";

function About() {
  const aboutInfo = {
    heading: "We Are Designers of Distinction",
    paragraphs: [
      "At 2125 Signatures, we blend artistry and ergonomics to create spaces that tell stories.",
      "Founded in Abuja, Nigeria, our mission is to elevate everyday living through elegant interior design."
    ],
    image: aboutHeader
  };

  return (
    <section className="about-section">
      <div className="about-hero">
        <div className="about-hero-text">
          <h2>{aboutInfo.heading}</h2>
          {aboutInfo.paragraphs.map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
        <div className="about-hero-image">
          <img src={aboutInfo.image} alt="About 2125 Signatures" />
        </div>
      </div>

      <div className="about-values">
        {/* Example values block — you can fetch from backend too */}
        <div className="value-box">
          <h3>Vision</h3>
          <p>To become the benchmark in luxurious, functional interiors.</p>
        </div>
        <div className="value-box">
          <h3>Mission</h3>
          <p>To bring elegance, comfort, and personality into every home.</p>
        </div>
        <div className="value-box">
          <h3>Philosophy</h3>
          <p>Design with purpose, live with beauty.</p>
        </div>
      </div>
    </section>
  );
}

export default About;
