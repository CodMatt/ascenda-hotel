import React, {useState} from 'react';

import {useStripe, useElements, PaymentElement, AddressElement} from '@stripe/react-stripe-js';
import { useNavigate } from "react-router-dom";
import PhoneInput from 'react-phone-number-input'


function PaymentForm() {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();



  // const [result, setResult] = useState(null);
  const [processing, setIsProcessing] = useState(false);
  
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

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);


    // setResult(null);
    setIsProcessing(true);
    
    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: 'http://localhost:4242/success', // link to processing page while saving to db
        
      }
    });

    if (result.error){
      console.log(result.error);
    } 

    setIsProcessing(false);
  }
  
  

  return (
    <form id = 'payment-form' onSubmit = {handleSubmit}>

      <label className = "salutation">Salutation: </label>

      <select name="salutation" onChange={(event) => setSalutation(event.target.value)} defaultValue= "" required = {true}>
        <option value = "">Select One</option>
        {validSalutations.map((validSalutation) => (
          <option value={validSalutation}>{validSalutation}</option>
        )
        )}
        
        <option value="">Others</option>
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

      <style> 
        {`
            .specialReqBox {
              width: 100%;
              height: 10%;
              padding: 12px 20px;
              box-sizing: border-box;
              border: 2px solid #ccc;
              border-radius: 1px;
              background-color: #272727ff;
              font-size: 14px;
              font-family: system-ui;
              resize: none;
            }
        `}
      </style>

      <textarea
        name="specialRequest"
        className="specialReqBox"
        placeholder="Special Request (max: 100 characters)"
        value={specialRequest}
        required={false}
        maxLength={150}
        onChange={(event) => setSpecialRequest(event.target.value)}
      />
      
      
      <PaymentElement/>
      <AddressElement
        options={{
          mode: 'billing', // or 'shipping'
        }}
      />
      <button disabled={processing || !stripe || !elements} id="button-text">
        <span id="button-text">
          {processing? <div className="spinner" id="spinner"></div>: "Pay now"}
        </span>
      </button>
      
    </form>
  );
};

export default PaymentForm;