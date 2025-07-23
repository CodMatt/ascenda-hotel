import React, {useState} from 'react';

import {useStripe, useElements, PaymentElement, AddressElement} from '@stripe/react-stripe-js';

import CardDeclinedNotification from './CardDeclinedNotification';


function PaymentForm() {
  const stripe = useStripe();
  const elements = useElements();
  
  const [processing, setIsProcessing] = useState(false);

  const [cardDeclined, setCardDeclined] = useState(false);


  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {

    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    
    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: 'http://localhost:4242/success', // link to processing page while saving to db
        
      }
    });

    if (result.error){
      console.log(result.error);
      setCardDeclined(true);
      setTimeout(() => setCardDeclined(false), 3000);
    } 

    setIsProcessing(false);
  }
  
  

  return (
    <div>
    <form id = 'payment-form' onSubmit = {handleSubmit}>
      <PaymentElement/>
      <AddressElement
        options={{
          mode: 'billing', 
        }}
      />
      <button disabled={processing || !stripe || !elements || cardDeclined} id="button-text">
        <span id="button-text">
          {processing? <div className="spinner" id="spinner"></div>: "Pay now"}
        </span>
      </button>
      
    </form>
    
    {cardDeclined? <CardDeclinedNotification/>:null}
    </div>
  );
};

export default PaymentForm;