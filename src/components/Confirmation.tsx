import React, {useEffect, useState} from "react";
import {Elements} from "@stripe/react-stripe-js"; // install

import { loadStripe } from "@stripe/stripe-js"; // install

import axios from "axios";

import { useLocation } from "react-router-dom";

import PaymentForm from './PaymentForm'

// call backend to get publishable key & load stripe with it
const initStripe = async () => {
    const res = await axios.get("/api/publishable-key");
    const publishableKey = await res.data.publishable_key;

    return loadStripe(publishableKey);
}

interface Booking {
  id: string;
  key: string;
  name: string;
  rates: number;
  duration: number;
  checkin: Date;
  checkout: Date;
  noAdults: number;
  noChildren: number;
  
}


function Confirmation(booking: Booking){
    const formatRates = booking.rates.toFixed(2); 
    const totalCost = booking.rates*booking.duration;

    const location = useLocation();
    const name = location.state?.firstName || false;
    
   

    const stripePromise = initStripe();

    const [clientSecretSettings, setClientSecretSettings] = useState({
        clientSecret: "",
        loading: true, // display once backend has replied
    });

    // to run on component mount
    useEffect(() => {
        async function createPaymentIntent(){ // async call to server to create stripe payment intent
            const response = await axios.post("/api/create-payment-intent", {});
            
            setClientSecretSettings({ // save client's secret key
                clientSecret: response.data.client_secret, // needed to complete payment using stripe element/ui
                loading: false,
            });
        }

        createPaymentIntent();
    }, []);

    

    
    return (
        <>
        <div>
        <h1>{name}'s booking</h1>
        <h5>From: {booking.checkin.toDateString()} To: {booking.checkout.toDateString()}</h5>
        <h6>Number of guests: {booking.noAdults} adults </h6>
        <h3>Per night: ${formatRates}</h3>
        <h3>Total: ${totalCost}</h3> 
        
        </div>
        
        <div>
        {clientSecretSettings.loading ? (
            <h1>Loading ...</h1>
        ) : (
            <Elements
            stripe={stripePromise}
            options={{
                clientSecret: clientSecretSettings.clientSecret,
                appearance: { theme: "night",
                    variables: {
                    colorPrimary: '#92b8ddff',
                    colorBackground: '',
                    colorText: 'rgba(199, 201, 228, 1)',
                    colorDanger: '#df1b41',
                    fontFamily: 'system-ui',
                    spacingUnit: '2px',
                    borderRadius: '4px',
                    // See all possible variables below
                }
                },
                
                
            }}
            >
            <PaymentForm />

            </Elements>
        )}
        </div>
        </>
        
    );
}

export default Confirmation;