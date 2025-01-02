import React from 'react';
import './CSS/Company.css';

const Company = () => {
  return (
    <div className="company">
      <h1>About Our Company</h1>
      <section className="company-intro">
        <p>
          Welcome to our company! Established in 1998, we aim to deliver top-quality products and services.
          Our team is dedicated to creating exceptional customer experiences and building lasting relationships.
        </p>
      </section>

      <section className="company-mission">
        <h2>Our Mission</h2>
        <p>To provide value and quality to our customers, creating innovative solutions for modern needs.</p>
      </section>

      <section className="company-values">
        <h2>Our Values</h2>
        <ul>
          <li>Integrity</li>
          <li>Quality</li>
          <li>Customer Satisfaction</li>
          <li>Innovation</li>
        </ul>
      </section>
    </div>
  );
};

export default Company;
