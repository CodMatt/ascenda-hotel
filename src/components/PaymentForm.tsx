import React, { useState } from 'react';
import { useStripe, useElements, PaymentElement, AddressElement } from '@stripe/react-stripe-js';
import { useLocation, useNavigate } from "react-router-dom";
import CardDeclinedNotification from './notifications/CardDeclinedNotification';
import '../styles/PaymentForm.css';

function PaymentForm() {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
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
  
  const destId = location.state.destId;
  const hotelId = location.state.hotelId;
  const userRef = location.state.userRef;
  const roomType = location.state.room_type;

  const key = location.state.key;
  const authToken = location.state.authToken;

  // const generateBookingId = () => {
  //   // Generate a random booking ID
  //   const timestamp = Date.now().toString().slice(-8);
  //   const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  //   return `BK${timestamp}${random}`;
  // };
  
  const [processing, setIsProcessing] = useState(false);
  const [cardDeclined, setCardDeclined] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const formatDisplayDate = (dateStr: any) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const day = date.getDate();
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    return `${day} ${month}`;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    // Store booking data in localStorage before Stripe redirect
    // const newBookingId = generateBookingId();  
    const newBookingId = "test1_placeholder13131323"


    const bookingData = {
      id: newBookingId,
      dest_id: destId,
      hotel_id: hotelId,
      nights: duration,
      start_date: checkin,
      end_date: checkout,
      adults: noAdults,
      children: noChildren,
      user_ref: userRef,
      salutations: salutation,
      first_name: firstName,
      last_name: lastName,
      phone_num: phoneNumber,
      email: emailAddress,
      msg_to_hotel: specialRequest,
      room_type: roomType,
      price: totalPrice,
      hotelName: hotelName,
      hotelAddr: hotelAddr,
      key: key,
      authToken: authToken,
      rates: rates
    };
    
    // Store in localStorage as backup for Stripe redirect
    localStorage.setItem('pendingBookingData', JSON.stringify(bookingData));
    console.log("Stored booking data in localStorage:", bookingData);

    // Try to encode data for URL as well (as backup to backup)
    let encodedData = '';
    try {
      const jsonString = JSON.stringify(bookingData);
      encodedData = btoa(jsonString);
      console.log("Encoded data length:", encodedData.length);
    } catch (error) {
      console.error("Error encoding booking data:", error);
    }

    // Include encoded data in return URL if not too long
    let returnUrl = `${window.location.origin}/success`;
    if (encodedData && encodedData.length < 1500) { // URL length limit safety
      returnUrl += `?data=${encodedData}`;
      console.log("Using URL with encoded data, total length:", returnUrl.length);
    } else {
      console.log("Data too long for URL, will rely on localStorage fallback");
    }
    
    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: returnUrl, // Use dynamic return URL
      }
    });

    // Original
    if (result.error) {
      // Remove stored data if payment fails
      localStorage.removeItem('pendingBookingData');
      
      if (result.error.decline_code === "card_not_supported") {
        setErrorMsg("Card not supported!");
        setCardDeclined(true);
        setTimeout(() => setCardDeclined(false), 3000);
      } else if (result.error){
        setErrorMsg("Payment Declined!");
        console.log(result.error);
      }

      setIsProcessing(false);

    } else {
      // Payment successful - Stripe will redirect automatically
      // The localStorage data will be retrieved in SuccessPage (hopefully :/)
      console.log("Payment successful! Stripe will redirect to:", returnUrl);
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
          
          <form id='payment-form' onSubmit={handleSubmit}>
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

        <div className="booking-summary">
          <h3>Booking Summary</h3>
          <div className="summary-item">
            <strong>{hotelName}</strong>
            <p>{hotelAddr}</p>
          </div>
          <div className="summary-item">
            <strong>Room Type:</strong> {roomType}
          </div>
          <div className="summary-item">
            <strong>Check-in:</strong> {formatDisplayDate(checkin)}
          </div>
          <div className="summary-item">
            <strong>Check-out:</strong> {formatDisplayDate(checkout)}
          </div>
          <div className="summary-item">
            <strong>Duration:</strong> {duration} nights
          </div>
          <div className="summary-item">
            <strong>Adults:</strong> {noAdults}
          </div>
          {noChildren > 0 && (
            <div className="summary-item">
              <strong>Children:</strong> {noChildren}
            </div>
          )}
          <div className="summary-item total">
            <strong>Total: ${totalPrice} SGD</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PaymentForm;