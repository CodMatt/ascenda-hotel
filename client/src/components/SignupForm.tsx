import React, { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { SignupData } from "../types/auth";
import isEmailValid from "../lib/IsEmailValid";
import isNameValid from "../lib/IsNameValid";
import isPhoneNumberValid from "../lib/IsPhoneNumberValid";
import CountryCodes from "../lib/CountryCodes";
import "../styles/RegisterPage.css";

const SignupForm: React.FC = () => {
  const { signup } = useAuth();
  const [formData, setFormData] = useState<SignupData>({
    username: "",
    email: "",
    password: "",
    phone_num: "",
    first_name: "",
    last_name: "",
    salutation: "",
  });
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [country, setCountry] = useState<string>("Singapore"); //default
  const [countryCode, setCountryCode] = useState<string>("65"); //default
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    //input validations
    if (!isEmailValid(formData.email)) {
      setError("Please enter a valid email.");
      setIsLoading(false);
      return;
    }

    if (
      !isNameValid(formData.first_name || "") ||
      !isNameValid(formData.last_name || "")
    ) {
      setError("Please enter a valid first and last name.");
      setIsLoading(false);
      return;
    }

    if (!isPhoneNumberValid(formData.phone_num, country, countryCode)) {
      setError("Please enter a valid phone number.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await signup(formData);

      if (response.ok) {
        navigate("/dashboard"); //TODO: CHANGE!! idk what we are navigating to
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Signup failed");
      }
    } catch (err) {
      setError("Network error occured");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error">{error}</div>}
  
      <div>
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleInputChange}
          required
          disabled={isLoading}
        />
      </div>
  
      <div>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleInputChange}
          required
          disabled={isLoading}
          onBlur={() => {
            if (!isEmailValid(formData.email)) {
              setError("Invalid email format");
            }
          }}
        />
      </div>
  
      <div>
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleInputChange}
          required
          disabled={isLoading}
        />
      </div>
  
      <div>
        <select
          name="country"
          value={country}
          onChange={(e) => {
            const selected = e.target.value;
            setCountry(selected);
            setCountryCode(CountryCodes[selected][1]);
          }}
          required
          disabled={isLoading}
        >
          {Object.entries(CountryCodes).map(([name, [, code]]) => (
            <option key={name} value={name}>
              {name} (+{code})
            </option>
          ))}
        </select>
      </div>
  
      <div>
        <input
          type="tel"
          name="phone_num"
          placeholder={`Phone Number (e.g., ${countryCode}12345678)`}
          value={formData.phone_num}
          onChange={handleInputChange}
          required
          disabled={isLoading}
        />
      </div>
  
      <div>
        <input
          type="text"
          name="first_name"
          placeholder="First Name"
          value={formData.first_name}
          onChange={handleInputChange}
          required
          disabled={isLoading}
        />
      </div>
  
      <div>
        <input
          type="text"
          name="last_name"
          placeholder="Last Name"
          value={formData.last_name}
          onChange={handleInputChange}
          required
          disabled={isLoading}
        />
      </div>
  
      <div>
        <input
          type="text"
          name="salutation"
          placeholder="Salutation"
          value={formData.salutation}
          onChange={handleInputChange}
          disabled={isLoading}
        />
      </div>
  
      <div>
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Creating Account..." : "Create Account"}
        </button>
      </div>
    </form>
  );
};

export default SignupForm;
