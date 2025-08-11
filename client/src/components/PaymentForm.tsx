import React, { useState, useEffect } from 'react';
import { useStripe, useElements, PaymentElement, AddressElement } from '@stripe/react-stripe-js';
import { useLocation, useNavigate } from "react-router-dom";
import CardDeclinedNotification from './notifications/CardDeclinedNotification';
import BookingSummary from './BookingSummary';
import { ClipLoader } from "react-spinners";

function PaymentForm() {
  const stripe = useStripe();
  const elements = useElements();
  const location = useLocation();
  
  // Extract all booking data from previous page
  const firstName = location.state.firstName;
  const lastName = location.state.lastName;
  const salutation = location.state.salutation;
  const phoneNumber = location.state.phoneNumber;
  const emailAddress = location.state.emailAddress;
  const specialRequest = location.state.specialRequest;
  
  const hotelName = location.state.hotelName;
  const hotelAddr = location.state.hotelAddr;
  const rates = location.state.rates;
  const checkin = location.state.checkin;
  const checkout = location.state.checkout;
  const noAdults = location.state.noAdults;
  const noChildren = location.state.noChildren;
  const duration = location.state.duration;
  const totalPrice = location.state.totalPrice;
  const noRooms = location.state.noRooms;
  
  const destId = location.state.destId;
  const hotelId = location.state.hotelId;
  const userRef = location.state.userRef;
  const roomType = location.state.roomType;
  const key = location.state.key;
  const authToken = location.state.authToken;
  
  const [processing, setIsProcessing] = useState(false);
  const [cardDeclined, setCardDeclined] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Disable back button while processing payment
  useEffect(() => {
    if (processing) {
      console.log('Payment processing - disabling back button');
      
      window.history.pushState({ processing: true }, '', window.location.pathname);
      
      const handleBackButton = (event:any) => {
        console.log('Back button blocked during payment processing');
        event.preventDefault();
        event.stopImmediatePropagation();
        alert('Please wait while your payment is being processed. Do not use the back button.');
        window.history.pushState({ processing: true }, '', window.location.pathname);
        return false;
      };

      window.addEventListener('popstate', handleBackButton);
      
      return () => {
        window.removeEventListener('popstate', handleBackButton);
      };
    }
  }, [processing]);

  const bookingData = {

      destId: destId,
      hotelId: hotelId,
      duration: duration,
      checkin: checkin,
      checkout: checkout,
      noAdults: noAdults,
      noChildren: noChildren,
      userRef: userRef,
      salutation: salutation,
      firstName: firstName,
      lastName: lastName,
      phoneNumber: phoneNumber,
      emailAddress: emailAddress,
      specialRequest: specialRequest,
      roomType: roomType,
      totalPrice: totalPrice,
      hotelName: hotelName,
      hotelAddr: hotelAddr,
      key: key,
      authToken: authToken,
      rates: rates,
      noRooms: noRooms
    };

  if (bookingData){
    sessionStorage.setItem('pendingBookingData', JSON.stringify(bookingData));
    console.log("Stored booking data in sessionStorage:", bookingData);
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!stripe || !elements || sessionStorage.getItem('pendingBookingData') === null) {
      return;
    }

    setIsProcessing(true);

    let returnUrl = `${window.location.origin}/success`;
    
    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: returnUrl,
      }
    });

    if (result.error) {
      if (result.error.decline_code === "card_not_supported") {
        setErrorMsg("Card not supported!");
        setCardDeclined(true);
        setTimeout(() => setCardDeclined(false), 3000);
      } else if (result.error){
        setErrorMsg("Payment Declined!");
        console.log(result.error);
      }
      setIsProcessing(false);
    }
  };

  return (
    <div className="payment-page">
      <div className="progress-bar">
        <div className="progress-step completed">✓</div>
        <div className="progress-step completed">✓</div>
        <div className="progress-step active">3</div>
        <div className="progress-step">4</div>
      </div>

      <h1>Payment Details</h1>

      {processing && (
        <div style={{ 
          padding: '15px', 
          backgroundColor: '#fff3cd', 
          border: '1px solid #ffeaa7', 
          borderRadius: '5px',
          color: '#856404',
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          <strong>⚠️ Processing payment... Please do not use the back button or refresh the page</strong>
        </div>
      )}

      <div className="payment-container">
        <div className="payment-form">
          <h2>Enter Payment Information</h2>
          
          <div className="customer-info-section">
            <h3>Customer Information</h3>
            <div className="customer-info-grid">
              <div className="info-row">
                <strong>Name:</strong> <span>{salutation} {firstName} {lastName}</span>
              </div>
              <div className="info-row">
                <strong>Email:</strong> <span>{emailAddress}</span>
              </div>
              <div className="info-row">
                <strong>Phone:</strong> <span>{phoneNumber}</span>
              </div>
              {specialRequest && (
                <div className="info-row">
                  <strong>Special Request:</strong> <span>{specialRequest}</span>
                </div>
              )}
            </div>
          </div>

          <form id='payment-form' onSubmit={(event) => handleSubmit(event)}>
            <div className="stripe-payment-section">
              <div className="form-group">
                <label>Payment Information</label>
                <div className="stripe-element-wrapper">
                  <PaymentElement />
                </div>
              </div>
            </div>

            <div className="billing-section">
              <h3>Billing Information</h3>
              <div className="stripe-element-wrapper">
                <AddressElement options={{ mode: 'billing' }} />
              </div>
            </div>

            {cardDeclined && (
              <div className="error-notifications">
                <CardDeclinedNotification errorMsg={errorMsg} />
              </div>
            )}

            <div className="payment-actions">
              <button 
                type="submit"
                className="pay-btn"
                disabled={processing || !stripe || !elements || cardDeclined}
                id="button-text"
              >
                <span>
                  {processing ? (
                    <div className="spinner" id="spinner">Processing...</div>
                  ) : (
                    `Pay $${totalPrice} SGD`
                  )}
                </span>
              </button>
            </div>
          </form>
        </div>

        <BookingSummary 
          hotelName={hotelName} 
          hotelAddr={hotelAddr} 
          rates={rates} 
          checkin={checkin} 
          checkout={checkout} 
          totalPrice={totalPrice} 
          noRooms={noRooms}
          noAdults={noAdults} 
          noChildren={noChildren}
        />
      </div>
    </div>
  );
}

export default PaymentForm;