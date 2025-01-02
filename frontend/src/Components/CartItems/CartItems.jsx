import React, { useContext, useState, useEffect } from "react";
import "./CartItems.css";
import cross_icon from "../Assets/cart_cross_icon.png";
import { ShopContext } from "../../Context/ShopContext";
import { backend_url, currency } from "../../App";
import axios from "axios";

const CartItems = () => {
  const { products, cartItems, removeFromCart, getTotalCartAmount, clearCart } = useContext(ShopContext);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [userInfo, setUserInfo] = useState({ name: "", mobile: "", address: "" });
  const [inventoryStatus, setInventoryStatus] = useState({});
  const [loading, setLoading] = useState(false);

  const checkInventory = async () => {
    try {
      // Filter the products in the cart and map to the required format with only productId
      const orderItems = products
        .filter((e) => cartItems[e.id] > 0)
        .map((e) => ({ id: e.id }));  // Only send the product id, no quantitySold
  
      // Fetch inventory status for the items in the cart
      const response = await axios.post(`${backend_url}/check-inventory`, {
        products: orderItems,  // Send the products in the expected format
      });
  
      if (response.data.success) {
        setInventoryStatus(response.data.inventoryStatus); // Update inventory status for UI validation
        return true;
      } else {
        alert("Inventory check failed: " + response.data.error);
        return false;
      }
    } catch (error) {
      console.error("Error checking inventory:", error);
      alert("There was an error checking inventory.");
      return false;
    }
  };
  
  

  // Function to handle initial "Place Order" click
  const handlePlaceOrder = async () => {
    if (getTotalCartAmount() === 0) {
      alert("Your cart is empty. Please add items to proceed with the order.");
      return;
    }

    const isInventoryValid = await checkInventory(); // Validate inventory before showing the order form
    if (isInventoryValid) {
      setShowOrderForm(true); // Show order form for user details
    }
  };

  // Function to handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserInfo({ ...userInfo, [name]: value });
  };

  // Function to handle confirming the order
  const handleConfirmOrder = async () => {
    const { name, mobile, address } = userInfo;

    if (!name || !mobile || !address) {
      alert("Please fill in all the fields.");
      return;
    }

    // Prepare items array to send to backend
    const orderItems = products
      .filter((e) => cartItems[e.id] > 0)
      .map((e) => ({
        productId: e.id,
        quantitySold: cartItems[e.id],
      }));

    try {
      setLoading(true); // Show loading state

      // Send order with user info to backend
      const response = await axios.post(`${backend_url}/purchase`, {
        items: orderItems,
        userInfo: { name, mobile, address },
      });

      if (response.data.success) {
        alert("Your order has been successfully placed!");
        clearCart(); // Clear the cart items after placing the order
        setShowOrderForm(false); // Hide the order form
      } else {
        alert("Error placing order: " + response.data.error);
      }
    } catch (error) {
      console.error("Error placing order:", error);
      alert("There was an error placing the order.");
    } finally {
      setLoading(false); // Hide loading state
    }
  };

  return (
    <div className="cartitems">
      <div className="cartitems-format-main">
        <p>Products</p>
        <p>Title</p>
        <p>Price</p>
        <p>Quantity</p>
        <p>Total</p>
        <p>Remove</p>
      </div>
      <hr />
      {products.filter((e) => cartItems[e.id] > 0).map((e) => (
        <div key={e.id}>
          <div className="cartitems-format-main cartitems-format">
            <img className="cartitems-product-icon" src={backend_url + e.image} alt="" />
            <p className="cartitems-product-title">{e.name}</p>
            <p>{currency}{e.new_price}</p>
            <button className="cartitems-quantity">{cartItems[e.id]}</button>
            <p>{currency}{e.new_price * cartItems[e.id]}</p>
            <img
              onClick={() => { removeFromCart(e.id); }}
              className="cartitems-remove-icon"
              src={cross_icon}
              alt=""
            />
          </div>
          <hr />
        </div>
      ))}

      <div className="cartitems-down">
        <div className="cartitems-total">
          <h1>Cart Totals</h1>
          <div>
            <div className="cartitems-total-item">
              <p>Subtotal</p>
              <p>{currency}{getTotalCartAmount()}</p>
            </div>
            <hr />
            <div className="cartitems-total-item">
              <p>Shipping Fee</p>
              <p>Free</p>
            </div>
            <hr />
            <div className="cartitems-total-item">
              <h3>Total</h3>
              <h3>{currency}{getTotalCartAmount()}</h3>
            </div>
          </div>
          <button onClick={handlePlaceOrder}>Place Order</button>
        </div>
      </div>

      {/* Order Confirmation Form */}
      {showOrderForm && (
        <div className="order-form">
          <h2>Confirm Order Details</h2>
          <label>
            Name:
            <input
              type="text"
              name="name"
              value={userInfo.name}
              onChange={handleInputChange}
            />
          </label>
          <label>
            Mobile:
            <input
              type="text"
              name="mobile"
              value={userInfo.mobile}
              onChange={handleInputChange}
            />
          </label>
          <label>
            Address:
            <textarea
              name="address"
              value={userInfo.address}
              onChange={handleInputChange}
            />
          </label>
          <button onClick={handleConfirmOrder} disabled={loading}>
            {loading ? "Processing..." : "Confirm Order"}
          </button>
        </div>
      )}
    </div>
  );
};

export default CartItems;
