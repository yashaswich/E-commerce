import React from "react";
import "./Admin.css";
import Sidebar from "../Components/Sidebar/Sidebar";
import AddProduct from "../Components/AddProduct/AddProduct";
import { Route, Routes } from "react-router-dom";
import ListProduct from "../Components/ListProduct/ListProduct";

const Admin = () => {

  return (
    <div className="admin">
      <Sidebar />
    </div>
  );
};

export default Admin;