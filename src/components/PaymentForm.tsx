import React, {useState} from 'react';

import {useStripe, useElements, PaymentElement, AddressElement} from '@stripe/react-stripe-js';

import PhoneInput from 'react-phone-number-input'


function PaymentForm() {
  const stripe = useStripe();
  const elements = useElements();
  



  // const [result, setResult] = useState(null);
  const [processing, setIsProcessing] = useState(false);
  
  // // Collected info to save in Db
  // const [firstName, setFirstName] = useState('');
  // const [lastName, setLastName] = useState('');
  // const [salutation, setSalutation] = useState('');
  // const [phoneNumber, setPhoneNumber] = useState('');
  // const [emailAddress, setEmailAddress] = useState('');
  // const [specialRequest, setSpecialRequest] = useState('');

  // const validSalutations = ["Mr", "Mrs", "Ms", "Miss"];

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

      
      
      <PaymentElement/>
      <AddressElement
        options={{
          mode: 'billing', 
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