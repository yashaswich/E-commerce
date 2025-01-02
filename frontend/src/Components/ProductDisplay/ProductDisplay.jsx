import React, { useState, useContext } from "react";
import "./ProductDisplay.css";
import { ShopContext } from "../../Context/ShopContext";
import { backend_url, currency } from "../../App";

const ProductDisplay = ({ product }) => {
  const { addToCart } = useContext(ShopContext);
  const [selectedSize, setSelectedSize] = useState(null);

  const handleSizeSelect = (size) => {
    setSelectedSize(size);
  };

  const isInDemand = product.demand > 15;
  const isPopular = product.demand > 5 && product.demand <= 15;

  return (
    <div className={`productdisplay ${isInDemand ? "demand-highlight" : ""}`}>
      <div className="productdisplay-left">
        <img
          className="productdisplay-main-img"
          src={`${product.image}`}
          alt="Product"
        />
      </div>
      <div className="productdisplay-right">
        {isInDemand && (
          <div className="productdisplay-right-demand-text">In High Demand!</div>
        )}
        <h1>{product.name}</h1>
        <div className="productdisplay-right-prices">
          <div className="productdisplay-right-price-old">
            {currency}{product.old_price}
          </div>
          <div className="productdisplay-right-price-new">
            {currency}{product.new_price}
          </div>
        </div>
        <div className="productdisplay-right-description">
          <p>{product.description}</p>
        </div>
        <div className="productdisplay-right-size">
          <h1>Select Size</h1>
          <div className="productdisplay-right-sizes">
            {["S", "M", "L", "XL", "XXL"].map((size) => (
              <div
                key={size}
                onClick={() => handleSizeSelect(size)}
                className={selectedSize === size ? "selected-size" : ""}
                role="button"
              >
                {size}
              </div>
            ))}
          </div>
          {product.demand>10 && (
            <p className="productdisplay-right-tag productdisplay-right-tag-popular">
             On Demand 🔥 
            </p>
          )}
        </div>
        {product.quantity>0 ? (
        <button
          onClick={() => {
            if (!selectedSize) {
              alert("Please select a size");
            } else {
              addToCart(product.id, selectedSize);
            }
          }}
          disabled={!selectedSize}
          className={!selectedSize ? "disabled-button" : ""}
          style={{marginTop: "10px"}}
        >
          ADD TO CART
        </button> ):(
         <button
         disabled
         className={"disabled-button"}
         style={{
           marginTop: "20px",
           backgroundColor: "#ccc", // Gray color for a disabled appearance
           cursor: "not-allowed",
           height: "50px",
           // or set to a fixed width if needed
           display: "flex", // Enable flexbox
           justifyContent: "center", // Center horizontally
           alignItems: "center", // Center vertically
           fontWeight: "bold", // Make the text bold if desired
           fontSize: "16px", // Adjust font size as needed
         }}
       >
         OUT OF STOCK
       </button>
      

        )}
        <p className="productdisplay-right-category">
          <span>Category :</span> {product.category}
        </p>
      </div>
    </div>
  );
};

export default ProductDisplay;
