import React from 'react';
import './CSS/About.css';

const About = () => {
  return (
    <div className="about">
      <h1>About Us</h1>
      
      <section className="about-story">
        <h2>Our Story</h2>
        <p>
          Founded in 1998, we started as a small team with a big dream: to revolutionize the way people experience
          quality products. Over the years, we’ve grown exponentially, building a global presence and earning 
          the trust of our customers through exceptional service and innovation.
        </p>
      </section>

      <section className="about-mission">
        <h2>Our Mission</h2>
        <p>
          Our mission is simple – to deliver the highest quality products and services, ensuring customer satisfaction
          every step of the way. We’re committed to continuous improvement and innovation, driven by a passion 
          for excellence and a desire to bring value to our customers.
        </p>
      </section>

      <section className="about-vision">
        <h2>Our Vision</h2>
        <p>
          Our vision is to be a globally recognized leader in our industry, known for our customer-centric approach, 
          innovative solutions, and commitment to sustainability. We believe in creating a better tomorrow, 
          one product and service at a time.
        </p>
      </section>

      <section className="about-values">
        <h2>Our Core Values</h2>
        <ul>
          <li><strong>Integrity:</strong> We uphold the highest standards of honesty and transparency in all our actions.</li>
          <li><strong>Customer Satisfaction:</strong> Our customers are at the heart of everything we do.</li>
          <li><strong>Innovation:</strong> We constantly evolve, embracing new ideas to improve our offerings.</li>
          <li><strong>Teamwork:</strong> We believe in the power of collaboration to achieve remarkable outcomes.</li>
        </ul>
      </section>

      <section className="about-team">
        <h2>Our Team</h2>
        <p>
          Our team is our greatest asset. Composed of skilled professionals and industry experts, our team 
          brings diverse perspectives, creativity, and a relentless dedication to excellence.
        </p>
      </section>

      <section className="about-achievements">
        <h2>Achievements</h2>
        <ul>
          <li>Awarded Best Customer Service in 2021</li>
          <li>Recognized as a Top 100 Innovator in 2020</li>
          <li>Partnered with over 500 global brands</li>
          <li>Serving millions of satisfied customers worldwide</li>
        </ul>
      </section>
    </div>
  );
};

export default About;
