import React, { useState, useEffect } from "react";
import "./CSS/LoginSignup.css";
import { jwtDecode } from "jwt-decode";
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
  const [forgotUsername, setForgotUsername] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");

  const requestUsernameReset = async () => {
    let dataObj;
    await fetch("http://localhost:4000/requestUsernameReset", {
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
      alert("OTP sent to your email. Please verify.");
      setOtpSent(true);
    } else {
      alert(dataObj.errors || "Unable to send OTP");
    }
  };

  const verifyOtpAndResetUsername = async () => {
    let dataObj;
    await fetch("http://localhost:4000/verifyOtpAndResetUsername", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: formData.email, otp }),
    })
      .then((resp) => resp.json())
      .then((data) => {
        dataObj = data;
      });
    console.log(dataObj);
    if (dataObj.success) {
      alert(`Your username is: ${dataObj.username}`);
    } else {
      alert(dataObj.errors || "Invalid OTP");
    }
  };


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
        console.log(dataObj)
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

  const resendOtp = async () => {
    try {
      const response = await fetch("http://localhost:4000/verifyOtpAndResetUsername", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: formData.email, resendOtp: true }),
      });

      const data = await response.json();
      if (data.success) {
        alert(data.message || "OTP resent successfully!");
      } else {
        alert(data.errors || "Error resending OTP");
      }
    } catch (error) {
      console.error("Error resending OTP:", error);
      alert("An error occurred while resending OTP. Please try again.");
    }
  };


  return (
    <div className="loginsignup">
      <div className="loginsignup-container">
        <h1>{forgotPassword ? "Forgot Password" : forgotUsername ? "Forgot Username" : state}</h1>
        <div className="loginsignup-fields">
          {/* Email input is always visible */}
          <input
            type="email"
            placeholder="Email address"
            name="email"
            value={formData.email}
            onChange={changeHandler}
          />

          {/* Show password and username inputs only for login or signup */}
          {!forgotPassword && !forgotUsername && !otpState ? (
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
                {state === "Login" && !forgotPassword && !otpState && !forgotUsername ? (
            <>
             <div className="forgot-links">
              <span
                className="forgot-link"
                onClick={() => setForgotPassword(true)}
              >
                Forgot Password
              </span>
              <span className="divider">|</span>
              <span
                className="forgot-link"
                onClick={() => setForgotUsername(true)}
              >
                Forgot Username
              </span>
            </div>
            </>
          ) : null}
              <button onClick={() => (state === "Login" ? login() : signup())}>
                Continue
              </button>
            </>
          ) : null}
        

          {/* Forgot Password UI */}
          {forgotPassword ? (
            <>
              <button onClick={requestPasswordReset}>Request Reset Link</button>
              <p className="loginsignup-login">
                Back to{" "}
                <span onClick={() => setForgotPassword(false)}>Login</span>
              </p>
            </>
          ) : null}

          {/* Forgot Username UI */}
          {forgotUsername && !otpSent ? (
            <>
              <button onClick={requestUsernameReset}>Send OTP</button>
              <p className="loginsignup-login">
                Back to{" "}
                <span onClick={() => setForgotUsername(false)}>Login</span>
              </p>
            </>
          ) : null}

          {forgotUsername && otpSent ? (
            <>
              <input
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
              <button onClick={verifyOtpAndResetUsername}>Verify OTP</button>
              <button onClick={resendOtp}>Resend OTP</button>
            </>
          ) : null}

          {/* Login actions */}
          {state === "Login" && !forgotPassword && !otpState && !forgotUsername ? (
            <>
              <p className="loginsignup-login">
                Create an account?{" "}
                <span onClick={() => setState("Sign Up")}>Click here</span>
              </p>
            </>
          ) : null}

          {/* Sign-up actions */}
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
