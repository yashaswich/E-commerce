import React from 'react'
import './Navbar.css'
import pavan from '../Assets/pavan.jpg'

const Navbar = () => {
  return (
    <div className='navbar'>
      <img src={pavan} className='nav-logo' alt="" />
    </div>
  )
}

export default Navbar
