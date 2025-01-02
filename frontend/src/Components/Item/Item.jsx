import React from 'react'
import './Item.css'
import { Link } from 'react-router-dom'
import { backend_url, currency } from '../../App'

const Item = (props) => {
  console.log(props.image)
  return (
    <div className='item'>
      <Link to={`/product/${props.id}`}><img onClick={window.scrollTo(0, 0)} src={props.image} alt="products"  style={{
      width: '100%',       // Ensures the image spans the container width
      height: 'auto',      // Maintains the aspect ratio
      objectFit: 'contain' // Ensures the entire image is visible
    }}  /></Link>
      <p>{props.name}</p>
      <div className="item-prices">
        <div className="item-price-new">{currency}{props.new_price}</div>
        <div className="item-price-old">{currency}{props.old_price}</div>
      </div>
    </div>
  )
}

export default Item
