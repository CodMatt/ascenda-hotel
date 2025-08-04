import React, {useEffect, useState} from "react";
import {Elements} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import axios from "axios";
import { useLocation } from "react-router-dom";
import PaymentForm from './PaymentForm'

// call backend to get publishable key & load stripe with it
const initStripe = async () => {
    try {
        const res = await axios.get("/api/stripe/publishable-key");
        const publishableKey = res.data.publishable_key; // Fixed: removed await
        
        if (!publishableKey) {
            throw new Error('No publishable key received from server');
        }
        
        console.log('Publishable key received:', publishableKey);
        return loadStripe(publishableKey);
    } catch (error) {
        console.error('Error initializing Stripe:', error);
        throw error;
    }
}

function Confirmation(){
    const location = useLocation();
    const bookingInfo = location.state;
    
    console.log("Booking Info in Confirmation:", bookingInfo);
    
    const totalCostInCents = bookingInfo.rates * bookingInfo.duration * 100;
    const stripePromise = initStripe();
    
    const [clientSecretSettings, setClientSecretSettings] = useState({
        clientSecret: "",
        loading: true,
        error: null as string | null, // Add error state
    });

    useEffect(() => {
        async function createPaymentIntent(){
            try {
                console.log('Creating payment intent for amount:', totalCostInCents);
                
                const response = await axios.post("/api/stripe/create-payment-intent", {
                    totalCost: totalCostInCents
                });
                
                console.log('Payment intent response:', response.data);
                
                setClientSecretSettings({
                    clientSecret: response.data.client_secret,
                    loading: false,
                    error: null,
                });
            } catch (error) {
                console.error('Error creating payment intent:', error);
                setClientSecretSettings({
                    clientSecret: "",
                    loading: false,
                    error: error instanceof Error ? error.message : 'Failed to create payment intent',
                });
            }
        }
        
        createPaymentIntent();
    }, [totalCostInCents]); // Add dependency

    if (clientSecretSettings.error) {
        return <div>Error: {clientSecretSettings.error}</div>;
    }

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
                            appearance: { 
                                theme: "stripe" as const, // Add type assertion
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