import React, {useState} from 'react';
import PhoneInput from 'react-phone-number-input'
import { useNavigate, useLocation } from "react-router-dom";

function PersonalInfoForm(){

  const navigate = useNavigate();
  const location = useLocation();

  // INFO FROM DummyPage (provided by previous feature)
  const hotelId = location.state.hotelId;
  const destId = location.state.destId;
  const key = location.state.key;
  const rates = location.state.rates;
  const checkin = location.state.checkin;
  const checkout = location.state.checkout;
  const noAdults = location.state.noAdults;
  const noChildren = location.state.noChildren;

  const duration = Math.abs((checkout-checkin)/(60*60*24*1000));
  

  // INFO COLLECTED HERE
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [salutation, setSalutation] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [specialRequest, setSpecialRequest] = useState('');

  const validSalutations = ["Mr", "Mrs", "Ms", "Miss"];

  
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    navigate("/payment", {
      state: {
      firstName: firstName,
      lastName: lastName,
      salutation: salutation,
      phoneNumber: phoneNumber,
      emailAddress: emailAddress,
      specialRequest: specialRequest,
      hotelId: hotelId, 
      destId: destId, 
      key: key,
      rates: rates,
      checkin: checkin,
      checkout: checkout,
      noAdults: noAdults,
      noChildren: noChildren,
      duration: duration,
     }});
  };

  return(
    <>
    <table border={1}>
      <tbody>
        <tr>
          <td>Hotel ID: </td><td>{hotelId}</td>
        </tr>
        <tr>
          <td>Destination ID: </td><td>{destId}</td>
        </tr>
        <tr>
          <td>Booking Key: </td><td>{key}</td>
        </tr>
        <tr>
          <td>Room per-night Rate: </td><td>{rates}</td>
        </tr>
        <tr>
          <td>Check-in Date: </td><td>{checkin.toDateString()}</td>
        </tr>
        <tr>
          <td>Check-out Date: </td><td>{checkout.toDateString()}</td>
        </tr>
        <tr>
          <td>No. Adults: </td><td>{noAdults}</td>
        </tr>
        <tr>
          <td>No. Children: </td><td>{noChildren}</td>
        </tr>
      </tbody>
    </table>

    <br/>

    <form id = 'personal-details-form' onSubmit = {handleSubmit} method="post">
        
      <label className = "salutation">Salutation: </label>

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
        required = {salutation==="Others"? true : false}
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

      <br/>

      <label className = "lastName">Last Name: </label>
      <input
        name="lastName"
        type="text"
        placeholder="Last Name"
        value={lastName}
        onChange={(event) => setLastName(event.target.value)}
        required = {true}
      />
      <br/>

      <style>
        {`
          .phone-flag .PhoneInputCountryIcon {
            width: 5%;
          }
        `}
      </style>

      <label className = "phoneNumber">Phone Number: </label>
      <PhoneInput
        
        className="phone-flag"
        name="phoneNumber"
        placeholder="Phone number"
        defaultCountry="SG"
        value={phoneNumber}
        onChange={(value) => setPhoneNumber}
        required = {true}
      />

      <label className = "emailAddress">Email Address: </label>
      <input
        name="emailAddress"
        type="email"
        placeholder="Email Address"
        value={emailAddress}
        onChange={(event) => setEmailAddress(event.target.value)}
        required = {true}
      />

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
      
      
      
      <button id="button-text">
        <span id="button-text">
          {"Confirm"}
        </span>
      </button>
      
    </form>
    </>
  );


}

export default PersonalInfoForm;