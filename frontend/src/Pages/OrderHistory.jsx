import React, { useEffect, useState } from "react";
import "./CSS/OrderHistory.css";

const OrderHistory = ({ userId }) => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetch(`http://localhost:4000/orderhistory/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setOrders(data.orders);
        }
      })
      .catch((error) => console.error("Error fetching order history:", error));
  }, [userId]);

  return (
    <div className="order-history">
      <h1>Your Order History</h1>
      {orders.length > 0 ? (
        orders.map((order) => (
          <div key={order.orderId} className="order-card">
            <h2>Order ID: {order.orderId}</h2>
            <p>Order Date: {new Date(order.orderDate).toLocaleDateString()}</p>
            <p>Total Amount: ${order.totalAmount}</p>
            <ul>
              {order.items.map((item, index) => (
                <li key={index}>
                  {item.name} (x{item.quantity}) - ${item.price}
                </li>
              ))}
            </ul>
          </div>
        ))
      ) : (
        <p>You have no orders yet.</p>
      )}
    </div>
  );
};

export default OrderHistory;
