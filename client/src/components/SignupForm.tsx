import React, { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { SignupData } from "../types/auth";

import isEmailValid from "../lib/IsEmailValid";
import isNameValid from "../lib/IsNameValid";
import isPhoneNumberValid from "../lib/IsPhoneNumberValid";
import isCountryValid from '../lib/IsCountryValid';

import CountryCodes from "../lib/CountryCodes";

// For error pop-up when entered details are not valid
import InvalidPhoneNotification from '../components/notifications/InvalidPhoneNotification';
import InvalidEmailNotification from '../components/notifications/InvalidEmailNotification';
import InvalidFirstNameNotification from '../components/notifications/InvalidFirstNameNotification';
import InvalidLastNameNotification from '../components/notifications/InvalidLastNameNotification';
import InvalidCountryNotification from '../components/notifications/InvalidCountryNotification';


import "../styles/RegisterPage.css";

const SignupForm: React.FC = () => {
  const { signup } = useAuth();
  
  const [message, setMessage] = useState<string>(""); // For create account failure
  const [success, setSuccess] = useState(false); // for deciding when to navigate


  const [isLoading, setIsLoading] = useState<boolean>(false);
  // const [country, setCountry] = useState<string>("Singapore"); //default
  // const [countryCode, setCountryCode] = useState<string>("65"); //default

  const countryCodes : { [key: string]: [number | number[], string] } = CountryCodes;

  // show errors
  const [showMessage, setShowMessage] = useState(false);

  // Info collected from user in this page
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [salutation, setSalutation] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  

  const [password, setPassword] = useState("");

  // Default to SG
  const [country, setCountry] = useState("Singapore");
  const [countryCode, setCountryCode] = useState("65");

  const validSalutations = ["Mr", "Mrs", "Ms", "Miss"];

  const updateCountry = (country: string) => {
    setCountry(country);
    if (country && Object.keys(CountryCodes).includes(country)){
      setCountryCode(CountryCodes[country][1]);
    } else {
      setCountryCode('');
    } 
  }

  const navigate = useNavigate();

  if (success){
    navigate("/HotelSearchPage"); //TODO: default to go home page for now
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    setShowMessage(true);
    setIsLoading(true);
    e.preventDefault();
    if (salutation && isNameValid(firstName) && isNameValid(lastName) 
      && isEmailValid(emailAddress) && isPhoneNumberValid(phoneNumber, country, countryCode)){
        setMessage("Creating account")
        try {
          
          const formData = {
            username: "placeholder",
            email: emailAddress,
            password: password,
            phone_num: countryCode + " " + phoneNumber,
            first_name: firstName,
            last_name: lastName,
            salutation: salutation,
            }
          
          const response = await signup(formData);

          console.log(response)
          
          if (response.ok) { // show success before 
            setTimeout(() => {
              setMessage("Account registration successful.");
              console.log("registration success");
              setSuccess(true);
            }, 5000)
            // navigate("/HotelSearchPage"); //TODO: default to go home page for now
          } else {
            const errorData = await response.json();
            console.log(errorData);
            setMessage(errorData.message || "Signup failed");
          }
        } catch (err) {
          setMessage("Network error occured.");
        } 
        
    } else {
      setMessage("Missing/invalid fields.")
    }
    setIsLoading(false);
 
  };

  

  return (
    <form onSubmit={handleSubmit}>
      {message && <div className="error">{message}</div>}
  
  
      <div>
        <input
          type="text"
          name="email"
          placeholder="Email"
          value={emailAddress}
          onChange={(event) => setEmailAddress(event.target.value)}
          required
          disabled={isLoading}
        />
      </div>
  
      <div>
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          disabled={isLoading}
        />
      </div>
  
      <div>
        <select 
          name="country" 
          onChange={(event) => updateCountry(event.target.value)} 
          defaultValue="" 
          required={true}
        >
          <option value="" key="select">Select One</option>
          {Object.keys(countryCodes).map((countryCode) => (
            <option value={countryCode} key={countryCode}>{countryCode}</option>
          ))}
          <option value="others" key="others">Others</option>
        </select>
        <input
          name="country code"
          type="text"
          placeholder="Code"
          value={countryCode}
          onChange={(event) => setCountryCode(event.target.value)}
          required={true}
          disabled={country === "others" ? false : true}
          className="phone-code-select"
        />
      </div>
  
      <div>
        <input
          name="phone_num"
          type="text"
          placeholder="Phone Number"
          value={phoneNumber}
          onChange={(event) => setPhoneNumber(event.target.value)}
          required={true}
          disabled={countryCode ? false : true || isLoading}
          className="phone-number-input"
        />
      </div>
  
      <div>
        <input
          name="first_name"
          type="text"
          placeholder="First Name"
          value={firstName}
          required={true}
          onChange={(event) => setFirstName(event.target.value)}
          disabled={isLoading}
        />
      </div>
  
      <div>
        <input
          name="last_name"
          type="text"
          placeholder="Last Name"
          value={lastName}
          onChange={(event) => setLastName(event.target.value)}
          required={true}
          disabled={isLoading}
        />
      </div>

      <div className="salutation-row">
        <select 
          name="salutation" 
          onChange={(event) => setSalutation(event.target.value)} 
          defaultValue="" 
          required={true}
          disabled={isLoading}
        >
          <option value="" key="select">Select One</option>
          {validSalutations.map((validSalutation) => (
            <option value={validSalutation} key={validSalutation}>{validSalutation}</option>
          ))}
          <option value="" key="others">Others</option>
        </select>
        
        <input
          type="text"
          placeholder="Salutation (if others)"
          value={salutation}
          onChange={(event) => setSalutation(event.target.value)}
          required={true}
          disabled={validSalutations.includes(salutation) || isLoading}
        />
      </div>

      {showMessage && (
              (!isNameValid(firstName) || 
              !isNameValid(lastName) || 
              !isCountryValid(country) ||
              !isPhoneNumberValid(phoneNumber, country, countryCode) || 
              !isEmailValid(emailAddress)) && (
              <div className="error-notifications">
                {!isNameValid(firstName) && <InvalidFirstNameNotification />}
                {!isNameValid(lastName) && <InvalidLastNameNotification />}
                {!isCountryValid(country) && <InvalidCountryNotification />}
                {!isPhoneNumberValid(phoneNumber, country, countryCode) && <InvalidPhoneNotification />}
                {!isEmailValid(emailAddress) && <InvalidEmailNotification />}
              </div>
            ))}
  
      <div>
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Creating Account..." : "Create Account"}
        </button>
      </div>
    </form>
  );
};

export default SignupForm;
