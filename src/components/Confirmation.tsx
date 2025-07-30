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
    
function Confirmation(){
    

     // INFO FROM PaymentInfoForm (provided by previous feature)
    const location = useLocation();
    const bookingInfo = location.state;

    // NOT TO USE - FOR REF (info contained by bookingInfo)
        // state: {
        //     firstName: firstName,
        //     lastName: lastName,
        //     salutation: salutation,
        //     phoneNumber: countryCode + phoneNumber,
        //     emailAddress: emailAddress,
        //     hotelId: hotelId, 
        //     destId: destId, 
        //     hotelName: hotelName,
        //     hotelAddr: hotelAddr,
        //     key: key,
        //     rates: rates,
        //     checkin: checkin,
        //     checkout: checkout,
        //     noAdults: noAdults,
        //     noChildren: noChildren,
        //     duration: duration,
        //     authToken: authToken,
        //     specialRequest: specialRequest,
        // }
    console.log("Booking Info in Confirmation:", bookingInfo);

    const totalCostInCents = bookingInfo.rates*bookingInfo.duration*100;

    const stripePromise = initStripe();

    const [clientSecretSettings, setClientSecretSettings] = useState({
        clientSecret: "",
        loading: true, // display once backend has replied
    });
    
    useEffect(() => {
        async function createPaymentIntent(){ // async call to server to create stripe payment intent
            const response = await axios.post("/api/create-payment-intent", {totalCost: totalCostInCents});
            
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
        {clientSecretSettings.loading ? (
            <h1>Loading ...</h1>
        ) : (
            <Elements
                stripe={stripePromise}
                options={{
                    clientSecret: clientSecretSettings.clientSecret,
                    appearance: { theme: "stripe",
                    },
                    
                }}
                >
                <PaymentForm/>
            </Elements>
        )}
        </div>
        </>
        
    );
}

export default Confirmation;