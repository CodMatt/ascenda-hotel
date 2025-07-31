// src/components/Register.tsx
import React from "react";
import logo from "../assets/logo.png";

interface RegisterProps {
  setCurrentPage: (page: string) => void;
}

export default function Register({ setCurrentPage }: RegisterProps) {
  return (
    <div className="signin-page">
      <div className="signin-wrapper">
      <img src={logo} alt="Ascenda logo" className="signin-logo" />
        <h2 className="signin-title">Create an Account</h2>

        <form className="signin-form">
          <div>
            <label htmlFor="salutation">Salutation</label>
            <select id="salutation" name="salutation" required>
              <option value="">— Select —</option>
              <option value="mr">Mr.</option>
              <option value="ms">Ms.</option>
              <option value="mrs">Mrs.</option>
              <option value="dr">Dr.</option>
            </select>
          </div>

          <div>
            <label htmlFor="firstName">First Name</label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              required
              autoComplete="given-name"
            />
          </div>

          <div>
            <label htmlFor="lastName">Last Name</label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              required
              autoComplete="family-name"
            />
          </div>

          <div>
            <label htmlFor="username">Username</label>
            <input
              id="username"
              name="username"
              type="text"
              required
              autoComplete="username"
            />
          </div>

          <div>
            <label htmlFor="phoneNumber">Phone Number</label>
            <input
              id="phoneNumber"
              name="phoneNumber"
              type="tel"
              required
              autoComplete="tel"
            />
          </div>

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
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="new-password"
            />
          </div>

          <button type="submit" className="signin-button">
            Create Account
          </button>
        </form>
      </div>
    </div>
  );
}
