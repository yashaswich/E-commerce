import React, { useEffect, useState } from "react";
import Hero from "../Components/Hero/Hero";
import Popular from "../Components/Popular/Popular";
import Offers from "../Components/Offers/Offers";
import NewCollections from "../Components/NewCollections/NewCollections";
import NewsLetter from "../Components/NewsLetter/NewsLetter";
import SearchBar from "../Components/SearchBar/SearchBar";
import Item from "../Components/Item/Item";
import PropTypes from "prop-types";

const Shop = ({ category }) => {
  const [popular, setPopular] = useState([]);
  const [newCollection, setNewCollection] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState(null); // Track errors
  const [loading, setLoading] = useState(false); // Track loading state

  // Fetch data for popular products and new collections
  const fetchInfo = async () => {
    try {
      setLoading(true);
      const popularResponse = await fetch(
        `http://localhost:4000/popularin${category || "women"}`
      );
      const popularData = await popularResponse.json();
      setPopular(popularData);

      const newCollectionResponse = await fetch(
        "http://localhost:4000/newcollections"
      );
      const newCollectionData = await newCollectionResponse.json();
      setNewCollection(newCollectionData);
    } catch (err) {
      setError("Failed to fetch data.");
    } finally {
      setLoading(false);
    }
  };

  // Handle search queries
  const handleSearch = async (query) => {
    if (query.trim() === "") {
      setIsSearching(false); // Reset to default view
      return;
    }

    setIsSearching(true);
    setLoading(true); // Show loader while searching
    try {
      const searchResponse = await fetch(
        `http://localhost:4000/search?q=${query}&category=${category || ""}`
      );
      const searchData = await searchResponse.json();
      setSearchResults(searchData);
    } catch (err) {
      setError("Failed to fetch search results.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInfo();
  }, [category]);

  return (
    <div>
      <SearchBar onSearch={handleSearch} category={category} />
      {loading && <p className="loading-message">Loading...</p>}
      {isSearching ? (
        <div className="search-results">
          <h1>Search Results</h1>
          <div className="results-container">
            {searchResults.length > 0 ? (
              searchResults.map((item) => (
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
              <p>No products found. Try a different search term.</p>
            )}
          </div>
        </div>
      ) : (
        <>
          <Hero />
          <Popular data={popular} />
          {popular.length === 0 && !error && <p>No popular products found.</p>}
          <Offers />
          <NewCollections data={newCollection} />
          {newCollection.length === 0 && !error && (
            <p>No new collections available.</p>
          )}
          <NewsLetter />
        </>
      )}
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

// Prop validation for category
Shop.propTypes = {
  category: PropTypes.string,
};

export default Shop;
