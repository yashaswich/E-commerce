import React from 'react'
import './Footer.css'
import { Link } from 'react-router-dom' // Import Link for navigation

import footer_logo from '../Assets/logo_big.png'
import instagram_icon from '../Assets/instagram_icon.png'
import whatsapp_icon from '../Assets/whatsapp_icon.png'

const Footer = () => {
  return (
    <div className='footer'>
      <div className="footer-logo">
        <img src={footer_logo} alt="Shopper Logo" />
        <p>SHOPPER</p>
      </div>
      <ul className="footer-links">
        <li><Link to="/company" style={{ textDecoration: 'none', color: 'inherit' }}>Company</Link></li>
        <li><Link to="/offices" style={{ textDecoration: 'none', color: 'inherit' }}>Offices</Link></li>
        <li><Link to="/about" style={{ textDecoration: 'none', color: 'inherit' }}>About</Link></li>
        <li><Link to="/contact" style={{ textDecoration: 'none', color: 'inherit' }}>Contact</Link></li>
      </ul>
      <div className="footer-social-icons">
        <div className="footer-icons-container">
          <p>pavan_kumar_royal_reddy</p>
          <img src={instagram_icon} alt="Instagram" />
        </div>
        <div className="footer-icons-container">
          <p>+1 816 582 0528</p>
          <img src={whatsapp_icon} alt="WhatsApp" />
        </div>
      </div>
      <div className="footer-copyright">
        <hr />
        <p>Copyright © 2023 - All Rights Reserved.</p>
      </div>
    </div>
  )
}

export default Footer
