import React, { useState } from "react";
import "./CSS/SearchPage.css";
import Item from "../Components/Item/Item";

const ITEMS_PER_PAGE = 8; // Number of items to display per page

const SearchPage = ({ searchResults }) => {
  const [currentPage, setCurrentPage] = useState(1); // Track current page

  const totalPages = Math.ceil(searchResults.length / ITEMS_PER_PAGE); // Calculate total pages

  const handlePageChange = (page) => {
    if (page !== currentPage) {
      setCurrentPage(page);
    }
  };

  // Get items for the current page
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentItems = searchResults.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="search-page">
      <h1 className="search-title">Search Results</h1>
      <div className="results-container">
        {currentItems.length > 0 ? (
          currentItems.map((item) => (
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
          <p className="no-results-message">No products found. Try a different search term.</p>
        )}
      </div>
      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="pagination">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => handlePageChange(i + 1)}
              className={currentPage === i + 1 ? "active" : ""}
              disabled={currentPage === i + 1} // Disable current page button
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchPage;
