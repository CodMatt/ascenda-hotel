import React, {useEffect, useState} from "react";
import {Elements} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import EmptyNavBar from "../components/EmptyNavBar";
import PaymentForm from '../components/PaymentForm'
import { ClipLoader } from "react-spinners";

const initStripe = async () => {
  const res = await axios.get("/api/stripe/publishable-key");
  const publishableKey = await res.data.publishable_key;
  return loadStripe(publishableKey);
}

function PaymentPage(){
  const location = useLocation();
  const navigate = useNavigate();
  const bookingInfo = location.state;
  
  // Check if we have booking data - if not, redirect to home
  useEffect(() => {
    if (!bookingInfo || !bookingInfo.totalPrice) {
      //console.log('No booking data found in PaymentPage - redirecting to home');
      navigate('/', { replace: true });
      return;
    }
  }, [bookingInfo, navigate]);

  // If no booking info, show loading while redirect happens
  if (!bookingInfo || !bookingInfo.totalPrice) {
    return (
      <div className="loader-overlay">
        <ClipLoader
          size={60}
          color="#0066cc"
          loading={true}
          aria-label="redirecting-loading"
        />
        <p>Redirecting...</p>
      </div>
    );
  }
  
  //console.log("Booking Info in Confirmation:", bookingInfo);
  const totalCostInCents = ((bookingInfo.totalPrice)*100).toFixed(0);
  const stripePromise = initStripe();
  const [clientSecretSettings, setClientSecretSettings] = useState({
    clientSecret: "",
    loading: true,
  });

  // Disable back button while loading payment intent
  useEffect(() => {
    if (clientSecretSettings.loading) {
      //console.log('Payment intent loading - disabling back button');
      
      window.history.pushState({ loading: true }, '', window.location.pathname);
      
      const handleBackButton = (event:any) => {
        //console.log('Back button blocked during payment intent loading');
        event.preventDefault();
        event.stopImmediatePropagation();
        alert('Please wait while we prepare your payment. Do not use the back button.');
        window.history.pushState({ loading: true }, '', window.location.pathname);
        return false;
      };

      window.addEventListener('popstate', handleBackButton);
      
      return () => {
        window.removeEventListener('popstate', handleBackButton);
      };
    }
  }, [clientSecretSettings.loading]);

  useEffect(() => {
    async function createPaymentIntent(){
      try {
        const response = await axios.post("/api/stripe/create-payment-intent", {totalCost: totalCostInCents});
        setClientSecretSettings({
          clientSecret: response.data.client_secret,
          loading: false,
        });
      } catch (error) {
        console.error('Error creating payment intent:', error);
        // If payment intent creation fails, redirect to home
        navigate('/', { replace: true });
      }
    }
    createPaymentIntent();
  }, [totalCostInCents, navigate]);

  return (
    <>
      <EmptyNavBar />
      <div>
        {clientSecretSettings.loading ? (
          <div className="loader-overlay">
            <ClipLoader
              size={60}
              color="#0066cc"
              loading={true}
              aria-label="mutating-dots-loading"
            />
            <p>Loading...</p>
            <div style={{ 
              marginTop: '20px', 
              padding: '15px', 
              backgroundColor: '#fff3cd', 
              border: '1px solid #ffeaa7', 
              borderRadius: '5px',
              color: '#856404'
            }}>
              <strong>⚠️ Please do not use the back button while we prepare your payment</strong>
            </div>
          </div>
        ) : (
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret: clientSecretSettings.clientSecret,
              appearance: { theme: "stripe" },
            }}
          >
            <PaymentForm/>
          </Elements>
        )}
      </div>
    </>
  );
}

export default PaymentPage;