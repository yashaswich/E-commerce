import React, { useEffect, useState } from 'react';
import './NewCollections.css';
import Item from '../Item/Item';
import { backend_url } from '../../App';

const NewCollections = () => {
  const [newCollectionsData, setNewCollectionsData] = useState([]);

  useEffect(() => {
    // Fetch new collections from the backend
    fetch(`${backend_url}/newcollections`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    })
      .then((res) => res.json())
      .then((data) => setNewCollectionsData(data))
      .catch((error) => console.error("Error fetching new collections:", error));
  }, []);

  return (
    <div className='new-collections'>
      <h1>NEW COLLECTIONS</h1>
      <hr />
      <div className="collections">
        {newCollectionsData.length > 0 ? (
          newCollectionsData.map((item, index) => (
            <Item
              key={item.id}
              id={item.id}
              name={item.name}
              image={item.image}
              new_price={item.new_price}
              old_price={item.old_price}
            />
          ))
        ) : (
          <p>No new collections available.</p>
        )}
      </div>
    </div>
  );
};

export default NewCollections;
