import React from 'react';
import './CSS/Offices.css';

const Offices = () => {
  return (
    <div className="offices">
      <h1>Our Offices</h1>
      <section className="office-locations">
        <h2>Global Presence</h2>
        <p>We have offices in various cities worldwide to serve you better.</p>
        <div className="office-grid">
          <div className="office-item">
            <h3>New York, USA</h3>
            <p>123 5th Avenue, New York, NY 10001</p>
          </div>
          <div className="office-item">
            <h3>Hyderabad, India</h3>
            <p>Pocharam Village, Ghatkesar, Hyderabad, Telangana, 500088</p>
          </div>
          <div className="office-item">
            <h3>New Missouri, UK</h3>
            <p>350 E Armour Blvd, Kansas City, NM, 64111</p>
          </div>
          <div className="office-item">
            <h3>New Delhi, India</h3>
            <p>Shershah Road, Justice SB Marg, New Delhi, 523328</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Offices;
