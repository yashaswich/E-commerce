import React from 'react';
import './Popular.css';
import Item from '../Item/Item';

const Popular = (props) => {
  return (
    <div className='popular'>
      <h1>POPULAR IN WOMEN</h1>
      <hr />
      <div className="popular-item">
        {props.data && props.data.length > 0 ? (
          props.data.map((item, index) => (
            <Item
              id={item.id}
              key={index}
              name={item.name}
              image={item.image}
              new_price={item.new_price}
              old_price={item.old_price}
            />
          ))
        ) : (
          <p>No popular products available in this category.</p>
        )}
      </div>
    </div>
  );
};

export default Popular;
