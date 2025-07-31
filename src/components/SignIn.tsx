import React from "react";
import logo from "../assets/logo.png";

export default function SignIn() {
  return (
    <div className="signin-page">
      <div className="signin-wrapper">
        <img src={logo} alt="Ascenda logo" className="signin-logo" />
        <h2 className="signin-title">Sign in to your account</h2>

        <form className="signin-form">
          <div>
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
            />
          </div>

          <div>
            <div className="signin-form-header">
              <label htmlFor="password">Password</label>
              <a href="#" className="forgot-link">
                Forgot password?
              </a>
            </div>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="signin-button">
            Sign in
          </button>
        </form>

        <p className="trial-text">
          Not a member?{" "}
          <a href="#">Start a 14 day free trial</a>
        </p>
      </div>
    </div>
);
}
