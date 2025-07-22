import React, {useState} from 'react';
import PhoneInput from 'react-phone-number-input'
import { useNavigate } from "react-router-dom";

function PersonalInfoForm(){

  let navigate = useNavigate();
      // Collected info to save in Db
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [salutation, setSalutation] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [specialRequest, setSpecialRequest] = useState('');

  const validSalutations = ["Mr", "Mrs", "Ms", "Miss"];

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log(phoneNumber);
    navigate("/payment", {state: {firstName: firstName }});
  };

  return(
    
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
            display: none;
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
  );


}

export default PersonalInfoForm;