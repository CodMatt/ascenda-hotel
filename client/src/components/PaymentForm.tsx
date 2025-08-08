import React, { useState } from 'react';
import { useStripe, useElements, PaymentElement, AddressElement } from '@stripe/react-stripe-js';
import { useLocation, useNavigate } from "react-router-dom";
import CardDeclinedNotification from './notifications/CardDeclinedNotification';
import BookingSummary from './BookingSummary' // For booking details display
//import '../styles/PaymentForm.css';

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

  // Store booking data in sessionStorage before Stripe redirect


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
      rates: rates
    };

  if (bookingData){
    // Store in sessionStorage!
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
        return_url: returnUrl, // Use dynamic return URL
      }
    });

    // Original
    if (result.error) {
      // // Remove stored data if payment fails
      // localStorage.removeItem('pendingBookingData');
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
                <AddressElement
                  options={{
                    mode: 'billing', 
                  }}
                />
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

        <BookingSummary hotelName = {hotelName} 
    hotelAddr = {hotelAddr} rates = {rates} 
    checkin = {checkin} checkout = {checkout} 
    totalPrice = {totalPrice} noRooms = {noRooms}
    noAdults = {noAdults} noChildren = {noChildren}/>
      </div>
    </div>
  );
}

export default PaymentForm;