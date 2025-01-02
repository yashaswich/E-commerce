import React, { useState, useEffect } from "react";
import "./CSS/LoginSignup.css";
import {jwtDecode} from "jwt-decode";
import { useSearchParams } from "react-router-dom";

const LoginSignup = () => {
  const [state, setState] = useState("Login");
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "user",
    id: "",
    token: "",
  });
  const [forgotPassword, setForgotPassword] = useState(false);
  const [otpState, setOtpState] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  const changeHandler = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const login = async () => {
    let dataObj;
    await fetch("http://localhost:4000/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })
      .then((resp) => resp.json())
      .then((data) => {
        dataObj = data;
      });

    if (dataObj.success) {
      localStorage.setItem("auth-token", dataObj.token);
      const decodedToken = jwtDecode(dataObj.token);
      const role = decodedToken.user.role;

      if (role === "admin") {
        window.location.replace("/admin-dashboard");
      } else {
        window.location.replace("/");
      }
    } else {
      alert(dataObj.errors);
    }
  };

  const signup = async () => {
    let dataObj;
    await fetch("http://localhost:4000/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })
      .then((resp) => resp.json())
      .then((data) => {
        dataObj = data;
      });

    if (dataObj.success) {
      localStorage.setItem("auth-token", dataObj.token);
      window.location.replace("/");
    } else {
      alert(dataObj.errors);
    }
  };

  const requestPasswordReset = async () => {
    let dataObj;
    await fetch("http://localhost:4000/requestPasswordReset", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: formData.email }),
    })
      .then((resp) => resp.json())
      .then((data) => {
        dataObj = data;
      });

    if (dataObj.success) {
      alert("Password reset link sent to your email");
    } else {
      alert(dataObj.errors || "Unable to send reset link");
    }
  }; 
  
  // Handle query parameters for password reset
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    const token = params.get("token");

    if (id && token) {
      setFormData({ ...formData, id, token });
      setOtpState(true); // Show the reset password form
    }
  }, []);

  return (
    <div className="loginsignup">
      <div className="loginsignup-container">
        <h1>{forgotPassword ? "Forgot Password" : state}</h1>
        <div className="loginsignup-fields">
          <input
            type="email"
            placeholder="Email address"
            name="email"
            value={formData.email}
            onChange={changeHandler}
          />

          {!forgotPassword && !otpState ? (
            <>
              {state === "Sign Up" && (
                <input
                  type="text"
                  placeholder="Your name"
                  name="username"
                  value={formData.username}
                  onChange={changeHandler}
                />
              )}
              <input
                type="password"
                placeholder="Password"
                name="password"
                value={formData.password}
                onChange={changeHandler}
              />
              <button onClick={() => (state === "Login" ? login() : signup())}>
                Continue
              </button>
            </>
          ) : null}

          {forgotPassword ? (
            <>
              <button onClick={requestPasswordReset}>Request Reset Link</button>
              <p className="loginsignup-login">
                Back to{" "}
                <span onClick={() => setForgotPassword(false)}>Login</span>
              </p>
            </>
          ) : null}
         

          {state === "Login" && !forgotPassword && !otpState ? (
            <>
              <p className="loginsignup-login">
                Create an account?{" "}
                <span onClick={() => setState("Sign Up")}>Click here</span>
              </p>
              <p className="loginsignup-login">
                Forgot Password?{" "}
                <span onClick={() => setForgotPassword(true)}>Click here</span>
              </p>
            </>
          ) : null}

          {state === "Sign Up" ? (
            <p className="loginsignup-login">
              Already have an account?{" "}
              <span onClick={() => setState("Login")}>Login here</span>
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default LoginSignup;
