import React, {useState} from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import PhoneNumberCodes from '../lib/PhoneNumberCodes';
import isPhoneNumberValid from '../lib/IsPhoneNumberValid';
import CountryCodes from '../lib/PhoneNumberCodes';

function GuestInfoForm(){

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

  
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    navigate("/payment", {
      state: {
      firstName: firstName,
      lastName: lastName,
      salutation: salutation,
      phoneNumber: countryCode + phoneNumber,
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
      authToken: authToken,
     }});
  };

  const handleSubmit2 = async () => {
    navigate("/"); // go back to hotel searching page
  }


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
              type="email"
              placeholder="Email Address"
              value={emailAddress}
              onChange={(event) => setEmailAddress(event.target.value)}
              required = {true}
            />

        </>)}

      
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
          {"Proceed to Payment"}
        </span>
      </button>
      
    </form>

    <form id = 'go-back' onSubmit = {handleSubmit2}>
      <button id="button-text2">
        <span id="button-text2">
          {"Change Booking Details"}
        </span>
      </button>
    </form>
    </>
  );


}

export default GuestInfoForm;