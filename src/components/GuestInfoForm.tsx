import React, {useState} from 'react';
import { useNavigate, useLocation } from "react-router-dom";

import BookingSummary from './BookingSummary' // For booking details display

// validity check functions
import isPhoneNumberValid from './lib/IsPhoneNumberValid';
import isNameValid from './lib/IsNameValid';
import isEmailValid from './lib/IsEmailValid';
import isCountryValid from './lib/IsCountryValid';

import CountryCodes from './lib/CountryCodes';

// For error pop-up when entered details are not valid
import InvalidPhoneNotification from './notifications/InvalidPhoneNotification';
import InvalidEmailNotification from './notifications/InvalidEmailNotification';
import InvalidFirstNameNotification from './notifications/InvalidFirstNameNotification';
import InvalidLastNameNotification from './notifications/InvalidLastNameNotification';
import InvalidCountryNotification from './notifications/InvalidCountryNotification';

// others
import calculateNights from './lib/CalculateNights';
import calculateTotalPrice from './lib/CalculateTotalPrice';


import '../styles/GuestInfoForm.css';

function GuestInfoForm(){

  const navigate = useNavigate();
  const location = useLocation();

  // data fetched from previous page
  const hotelId = location.state.hotelId;
  const destId = location.state.destId;
  const hotelName = location.state.hotelName;
  const hotelAddr = location.state.hotelAddr;
  const key = location.state.key;
  const rates = location.state.rates;
  const checkin = location.state.checkin;
  const checkout = location.state.checkout;
  const noAdults = location.state.noAdults;
  const noChildren = location.state.noChildren;

  const authToken = location.state.authToken;

  const duration = calculateNights(checkin, checkout);

  // Additional data needed for next few pages
  const userRef = location.state.userRef;
  const roomType = location.state.roomType;


  // Info collected from user in this page
  const [firstName, setFirstName] = useState(location.state.firstName);
  const [lastName, setLastName] = useState(location.state.lastName);
  const [salutation, setSalutation] = useState(location.state.salutation);
  const [phoneNumber, setPhoneNumber] = useState(location.state.phoneNumber);
  const [emailAddress, setEmailAddress] = useState(location.state.emailAddress);
  const [specialRequest, setSpecialRequest] = useState(location.state.specialRequest);

  const countryCodes : { [key: string]: [number | number[], string] } = CountryCodes;

  // Use country and countryCode from previous page if auth user, otherwise start empty
  const [country, setCountry] = useState(authToken ? (location.state.country || '') : '');
  const [countryCode, setCountryCode] = useState(authToken ? (location.state.countryCode || '') : '');

  

  const updateCountry = (country: string) => {
      setCountry(country);
    if (country && Object.keys(countryCodes).includes(country)){
      setCountryCode(countryCodes[country][1]);
    } else {
      setCountryCode('');
    } 
  }

  const validSalutations = ["Mr", "Mrs", "Ms", "Miss"];

  const [showErrors, setShowErrors] = useState(false);

  
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
      if (authToken || (isNameValid(firstName) && isNameValid(lastName) && isEmailValid(emailAddress) && isPhoneNumberValid(phoneNumber, country, countryCode))){
        navigate("/payment", {
        state: {
        userRef: userRef,
        roomType: roomType,

        firstName: firstName,
        lastName: lastName,
        salutation: salutation,
        phoneNumber: countryCode + " " + phoneNumber, // split by country code & phone number
        emailAddress: emailAddress,
        hotelId: hotelId, 
        destId: destId, 
        hotelName: hotelName,
        hotelAddr: hotelAddr,
        key: key,
        rates: rates,
        checkin: checkin,
        checkout: checkout,
        noAdults: noAdults,
        noChildren: noChildren,
        duration: duration,
        authToken: authToken,
        specialRequest: specialRequest,
        totalPrice: calculateTotalPrice(rates, checkin, checkout, "dollars"),
        }});

      } else {
        setShowErrors(true);
      }
      
  };

  const handleSubmit2 = async () => {
    navigate("/"); // go back to hotel searching page
  }


  return(
    <div className="payment-page">
      <div className="progress-bar">
        {/* <div className="progress-step completed">✓</div> */}
        <div className="progress-step completed">✓</div>
        <div className="progress-step active">2</div>
        <div className="progress-step">3</div>
        <div className="progress-step">4</div>
      </div>

      <h1>Payment Details</h1>

      <div className="payment-container">
        <div className="payment-form">
          <h2>Enter Personal Information</h2>

          <form id='personal-details-form' onSubmit={handleSubmit} method="post">
            
            {authToken ? (
              // If user is authenticated
              <div className="authenticated-user-info">
                <h3>Your Information</h3>
                <div className="user-info-grid">
                  <div className="info-row">
                    <strong>Name:</strong> <span>{firstName} {lastName}</span>
                  </div>
                  <div className="info-row">
                    <strong>Salutation:</strong> <span>{salutation}</span>
                  </div>
                  <div className="info-row">
                    <strong>Phone Number:</strong> <span>{phoneNumber}</span>
                  </div>
                  <div className="info-row">
                    <strong>Email Address:</strong> <span>{emailAddress}</span>
                  </div>
                </div>
              </div>
            ) : (
              // If user is not authenticated
              <>
                <div className="form-group">
                  <label>Salutation</label>
                  <div className="salutation-row">
                    <select 
                      name="salutation" 
                      onChange={(event) => setSalutation(event.target.value)} 
                      defaultValue="" 
                      required={true}
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
                      disabled={validSalutations.includes(salutation)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>First Name</label>
                  <input
                    name="firstName"
                    type="text"
                    placeholder="First Name"
                    value={firstName}
                    required={true}
                    onChange={(event) => setFirstName(event.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Last Name</label>
                  <input
                    name="lastName"
                    type="text"
                    placeholder="Last Name"
                    value={lastName}
                    onChange={(event) => setLastName(event.target.value)}
                    required={true}
                  />
                </div>

                <div className="form-group">
                  <label>Country</label>
                  <select 
                    name="phoneCode" 
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
                </div>

                <div className="form-group">
                  <label>Phone Number</label>
                  <div className="phone-number-row">
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
                    <input
                      name="phoneNumber"
                      type="text"
                      placeholder="Phone Number"
                      value={phoneNumber}
                      onChange={(event) => setPhoneNumber(event.target.value)}
                      required={true}
                      disabled={countryCode ? false : true}
                      className="phone-number-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    name="emailAddress"
                    type="text"
                    placeholder="Email Address"
                    value={emailAddress}
                    onChange={(event) => setEmailAddress(event.target.value)}
                    required={true}
                  />
                </div>
              </>
            )}
            
            <div className="form-group">
              <label>Special Request</label>
              <textarea
                name="specialRequest"
                className="specialReqBox"
                placeholder="Special Request (max: 150 characters)"
                value={specialRequest}
                required={false}
                maxLength={150}
                onChange={(event) => setSpecialRequest(event.target.value)}
              />
            </div>

            {showErrors && (
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

            <div className="payment-actions">
              <button type="submit" className="pay-btn" id="payment-button">
                <span>Proceed to Payment</span>
              </button>
            </div>
          </form>

          <div className="payment-actions" style={{ marginTop: '15px' }}>
            <button 
              type="button"
              className="back-btn"
              onClick={handleSubmit2}
            >
              <span>Change Booking Details</span>
            </button>
          </div>
        </div>

        <BookingSummary hotelName = {hotelName} 
          hotelAddr = {hotelAddr} rates = {rates} 
          checkin = {checkin} checkout = {checkout} 
          noAdults = {noAdults} noChildren = {noChildren}/>
      </div>
    </div>
  );
}

export default GuestInfoForm;