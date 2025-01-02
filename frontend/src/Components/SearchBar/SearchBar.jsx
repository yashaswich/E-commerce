import React, { useState } from "react";
import "./SearchBar.css";

const SearchBar = ({ onSearch, category }) => {
  const [query, setQuery] = useState("");

  const handleSearch = () => {
    if (query.trim() === "") {
      alert("Please enter a search term");
      return;
    }
    // Trigger the parent's search function with query and category
    onSearch(query, category);
  };

  return (
    <div className="search-bar">
      <input
        type="text"
        placeholder="Search for products..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button onClick={handleSearch}>Search</button>
    </div>
  );
};

export default SearchBar;
