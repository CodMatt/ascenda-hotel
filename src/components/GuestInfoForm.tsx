import React, {useState} from 'react';
import { useNavigate, useLocation } from "react-router-dom";

import BookingDetails from './BookingDetails' // For booking details display

// validity check functions
import isPhoneNumberValid from '../lib/IsPhoneNumberValid';
import isNameValid from '../lib/IsNameValid';
import isEmailValid from '../lib/IsEmailValid';

import CountryCodes from '../lib/CountryCodes';

// For error pop-up when entered details are not valid
import InvalidPhoneNotification from './notifications/InvalidPhoneNotification';
import InvalidEmailNotification from './notifications/InvalidEmailNotification';
import InvalidFirstNameNotification from './notifications/InvalidFirstNameNotification';
import InvalidLastNameNotification from './notifications/InvalidLastNameNotification';

function GuestInfoForm(){

  const navigate = useNavigate();
  const location = useLocation();

  // INFO FROM DummyPage (provided by previous feature)
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

  const duration = Math.abs((checkout-checkin)/(60*60*24*1000));
  

  // INFO COLLECTED HERE
  const [firstName, setFirstName] = useState(location.state.firstName);
  const [lastName, setLastName] = useState(location.state.lastName);
  const [salutation, setSalutation] = useState(location.state.salutation);
  const [phoneNumber, setPhoneNumber] = useState(location.state.phoneNumber);
  const [emailAddress, setEmailAddress] = useState(location.state.emailAddress);
  const [specialRequest, setSpecialRequest] = useState(location.state.specialRequest);

  const countryCodes : { [key: string]: [number | number[], string] } = CountryCodes;
  const [country, setCountry] = useState('');
  const [countryCode, setCountryCode] = useState('');

  const updateCountry = (country: string) => {
      setCountry(country);
    if (Object.keys(countryCodes).includes(country)){
      setCountryCode(countryCodes[country][1]);
    } else {
      setCountryCode('');
    } 
  }

  const validSalutations = ["Mr", "Mrs", "Ms", "Miss"];

  const [showErrors, setShowErrors] = useState(false);

  
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {


    event.preventDefault();
      if (isNameValid(firstName) && isNameValid(lastName) && isEmailValid(emailAddress) && isPhoneNumberValid(phoneNumber, country, countryCode)){
        navigate("/payment", {
        state: {
        firstName: firstName,
        lastName: lastName,
        salutation: salutation,
        phoneNumber: countryCode + phoneNumber,
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
        }});

      } else {
        setShowErrors(true);
      }
      
  };

  const handleSubmit2 = async () => {
    navigate("/"); // go back to hotel searching page
  }


  return(
    <>

    <BookingDetails hotelName = {hotelName} 
    hotelAddr = {hotelAddr} rates = {rates} 
    checkin = {checkin} checkout = {checkout} 
    noAdults = {noAdults} noChildren = {noChildren}  />


    <br/>

    <form id = 'personal-details-form' onSubmit = {handleSubmit} method="post">
      
      {authToken?(
            <table border={1}>
        <tbody>
            <tr>
            <td>Name: </td><td>{firstName} {lastName}</td>
            </tr>
            <tr>
            <td>Salutation: </td><td>{salutation}</td>
            </tr>
            <tr>
            <td>Phone Number: </td><td>{phoneNumber}</td>
            </tr>
            <tr>
            <td>Email Address: </td><td>{emailAddress}</td>
            </tr>
            
        </tbody>
        </table>
        ) : (
          <><label className = "salutation">Salutation: </label>

            <select name="salutation" onChange={(event) => setSalutation(event.target.value)} defaultValue= "" required = {true}>
              <option value = "" key = "select">Select One</option>
              {validSalutations.map((validSalutation) => (
                <option value={validSalutation} key={validSalutation}>{validSalutation}</option>
              )
              )}
              
              <option value="" key = "others">Others</option>
            </select>
            
            <input
              type="text"
              placeholder="Salutation (if others)"
              value={salutation}
              onChange={(event) => setSalutation(event.target.value)}
              required = {true}
              disabled = {validSalutations.includes(salutation)? true : false}

            />
          
            <br/>

            <label className = "firstName">First Name: </label>
            <input
              name="firstName"
              type="text"
              placeholder="First Name"
              value={firstName}
              required = {true}
              onChange={(event) => setFirstName(event.target.value)}
            />

            <label className = "lastName"> Last Name: </label>
            <input
              name="lastName"
              type="text"
              placeholder="Last Name"
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
              required = {true}
            />
            <br/>


            <label className = "phoneCode"> Country: </label>
            <select name="phoneCode" onChange={(event) => updateCountry(event.target.value)} defaultValue= "" required = {true}>
              <option value = "" key = "select">Select One</option>
              {Object.keys(countryCodes).map((countryCode) => (
                <option value={countryCode} key={countryCode}>{countryCode}</option>
              )
              )}
            
              <option value="others" key = "others">Others</option>
            </select>

            <br/>

            <label className = "countryCode"> Phone number: +</label>
            <input
              name="country code"
              type="text"
              placeholder="Country Code (if others)"
              value={countryCode}
              onChange={(event) => setCountryCode(event.target.value)}
              required = {true}
              disabled = {country=="others"?false:true}

            />

            <input
              name="phoneNumber"
              type="text"
              placeholder="Phone Number"
              value={phoneNumber}
              onChange={(event) => setPhoneNumber(event.target.value)}
              required = {true}
              disabled = {countryCode?false:true}
            />

            

            <br/>

          
            <label className = "emailAddress">Email Address: </label>
            <input
              name="emailAddress"
              type="textt"
              placeholder="Email Address"
              value={emailAddress}
              onChange={(event) => setEmailAddress(event.target.value)}
              required = {true}
            />

            

        </>)}
        {showErrors?
        <>
        {!isNameValid(firstName)? <InvalidFirstNameNotification />:null}
        {!isNameValid(lastName)? <InvalidLastNameNotification />:null}
        {!isPhoneNumberValid(phoneNumber, country, countryCode)? <InvalidPhoneNotification />:null}
        {!isEmailValid(emailAddress)? <InvalidEmailNotification />:null}
        </>
        : null}
        
      
      <br/>
      <label className = "specialRequest">Special Request: </label>
      <br/>

      <textarea
        name="specialRequest"
        className="specialReqBox"
        placeholder="Special Request (max: 100 characters)"
        value={specialRequest}
        required={false}
        maxLength={150}
        onChange={(event) => setSpecialRequest(event.target.value)}
      />

      <br/>
      
      
      
      <button id="payment-button">
        <span id="payment-button">
          {"Proceed to Payment"}
        </span>
      </button>
      
    </form>

    <form id = 'go-back' onSubmit = {handleSubmit2}>
      <button id="bdetails-button" >
        <span id="bdetails-button">
          {"Change Booking Details"}
        </span>
      </button>
    </form>
    </>
  );


}

export default GuestInfoForm;